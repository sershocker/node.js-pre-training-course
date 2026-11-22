const e = require("express");
const fs = require("fs");
const { Transform } = require("stream");
const { pipeline } = require("stream/promises");

class CSVParser extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    // TODO: Initialize properties
    this.headers = null;
    this.lineNumber = 0;
    this.buffer = "";
  }

  _transform(chunk, encoding, callback) {
    try {
      this.buffer += chunk.toString().replaceAll("\r", "");
      this.newObjects = this.buffer.split("\n");
      this.buffer = this.newObjects.pop() ?? "";

      for (const line of this.newObjects) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        this.lineNumber++;
        if (!this.headers) {
          this.headers = cleanLine.split(",").map((header) => header.trim());
          continue;
        }

        const values = cleanLine.split(",").map((value) => value.trim());
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index] ?? "";
        });
        this.push(record);
      }
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    try {
      if (this.buffer.trim()) {
        this.lineNumber++;
        const values = this.buffer.split(",").map((cutter) => cutter.trim());
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index] ?? "";
        });
        this.push(record);
      }
      this.buffer = "";
      // TODO: Process any remaining data in buffer
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

/**
 * Data Transformer Stream
 * Applies transformations to each record
 */
class DataTransformer extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
  }

  _transform(record, encoding, callback) {
    record.name = capitalizeName(record.name);
    record.email = normalizeEmail(record.email);
    record.phone = formatPhone(record.phone);
    record.birthdate = standardizeDate(record.birthdate);
    record.city = capitalizeName(record.city);
    this.push(record);
    callback();
  }
}

/**
 * CSV Writer Transform Stream
 * Converts objects back to CSV format
 */
class CSVWriter extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
    // TODO: Initialize properties
    this.headerWritten = false;
  }

  _transform(record, encoding, callback) {
    try {
      if (!record) {
        throw new Error();
      }
      if (!this.headerWritten) {
        const headers = Object.keys(record)
          .map((key) => this._formatter(key))
          .toString();
        this.headerWritten = true;
        this.push(headers + "\n");
      }
      let output = "";
      output =
        Object.values(record)
          .map((value) => this._formatter(value))
          .join(",") + "\n";

      this.push(output);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _formatter(value) {
    if (value === null || value === undefined) return "";
    value = value.toString();
    if (value.includes(`"`)) value = value.replaceAll(`"`, `""`);
    if (value.includes(`,`) || value.includes("\n") || value.includes(`"`)) value = `"` + value + `"`;
    return value;
  }
}

/**
 * Helper Functions
 */

/**
 * Capitalize names properly
 * @param {string} name - Name to capitalize
 * @returns {string} Capitalized name
 */
function capitalizeName(name) {
  return name.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());
}

/**
 * Normalize email addresses
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email or original if invalid
 */
function normalizeEmail(email) {
  const emailArray = email.trim().split("@");
  if (emailArray.length !== 2 || emailArray[0].length === 0 || emailArray[1].length === 0) return email;
  const dotArray = emailArray[1].split(".");
  if (dotArray.length < 2 || dotArray[dotArray.length - 1].length === 0) return email;

  return email.toLowerCase().trim();
}

/**
 * Format phone numbers
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone or "INVALID"
 */
function formatPhone(phone) {
  if (/\p{L}/u.test(phone)) return "INVALID";
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length !== 10) return "INVALID";
  const newPhone = numbers.replace(/^(\d{3})(\d{3})(\d{4})$/, "($1) $2-$3");

  return newPhone;
}

/**
 * Standardize date formats
 * @param {string} date - Date to standardize
 * @returns {string} Date in YYYY-MM-DD format
 */
function standardizeDate(date) {
  if (!date) return "";
  //if (data === "12/25/1990") return "1990-12-25";
  if (date.length !== 10) return date;
  const dateArray = date.trim().split(/[-/]/);
  if (dateArray.length !== 3) return date;

  let day, month, year;
  if (dateArray[0].length === 4) {
    [year, month, day] = dateArray;
  } else if (dateArray[2].length === 4) {
    [month, day, year] = dateArray;
  }
  if (/\p{L}/u.test(day) || /\p{L}/u.test(month) || /\p{L}/u.test(year)) return date;
  if (Number(day) > 31 || Number(month) > 12 || Number(year) < 1970) return date;

  const validDate = new Date(year, month - 1, day);

  if (validDate.getFullYear() != year || validDate.getMonth() != month - 1 || validDate.getDate() != day)
    return date + "5";

  if (day.length === 1) day = "0" + day;
  if (month.length === 1) month = "0" + month;

  return `${year}-${month}-${day}`;
}

/**
 * Main function to process CSV file
 * @param {string} inputPath - Path to input CSV file
 * @param {string} outputPath - Path to output CSV file
 * @returns {Promise} Promise that resolves when processing is complete
 */
async function processCSVFile(inputPath, outputPath) {
  try {
    await pipeline(
      fs.createReadStream(inputPath),
      new CSVParser(),
      new DataTransformer(),
      new CSVWriter(),
      fs.createWriteStream(outputPath),
    );
  } catch (error) {
    throw new Error(`Failed to process CSV file: ${error.message}`);
  }
}

/**
 * Create sample input data for testing
 */
function createSampleData() {
  fs.mkdirSync("data", { recursive: true });
  const data = `name,email,phone,birthdate,city
john doe,JOHN.DOE@EXAMPLE.COM,1234567890,12/25/1990,new york
jane smith,Jane.Smith@Gmail.Com,555-123-4567,1985-03-15,los angeles
bob johnson,BOB@TEST.COM,invalid-phone,03/22/1992,chicago
alice brown,alice.brown@company.org,9876543210,1988/07/04,houston`;
  fs.writeFileSync("data/users.csv", data, "utf8");
}

// Export classes and functions
module.exports = {
  CSVParser,
  DataTransformer,
  CSVWriter,
  processCSVFile,
  capitalizeName,
  normalizeEmail,
  formatPhone,
  standardizeDate,
  createSampleData,
};

// Example usage (for testing):
const isReadyToTest = true;

if (isReadyToTest) {
  // Create sample data
  createSampleData();

  // Process the file
  processCSVFile("data/users.csv", "data/users_transformed.csv")
    .then(() => {
      console.log("✅ File transformation completed successfully!");

      // Read and display results
      const output = fs.readFileSync("data/users_transformed.csv", "utf-8");
      console.log("\n📄 Transformed CSV output:");
      console.log(output);
    })
    .catch((error) => {
      console.error("❌ Error processing file:", error.message);
    });
}
