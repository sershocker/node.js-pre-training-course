const fs = require("fs");
const { Transform } = require("stream");
const { pipeline } = require("stream/promises");
//import { MessageSystem } from "./task-01";

class ProgressReport {
  constructor(size) {
    this.isValidData = true;
    if (typeof size?.size !== "number") {
      this.isValidData = false;
      return;
    }
    this.totalSize = size.size;
    this.progress = 0;
    console.log(size.size);
    this.progressPercentPrev = -1;
  }
  progressView(bytes) {
    if (!this.isValidData) return;
    this.progress += bytes;
    if (this.totalSize !== 0) {
      const progressPercent = Math.floor((this.progress / this.totalSize) * 100);
      if (progressPercent !== Math.floor(this.progressPercentPrev)) {
        console.log(`${progressPercent} %`);
      }
      this.progressPercentPrev = progressPercent;
    }
  }
}

class CSVParser extends Transform {
  constructor(delimiter = ",", size, options) {
    super({ objectMode: true });
    // TODO: Initialize properties
    this.progressReport = new ProgressReport(size);
    this.headers = null;
    this.lineNumber = 0;
    this.buffer = "";
    this.delimiter = delimiter || ",";
  }

  _transform(chunk, encoding, callback) {
    try {
      this.buffer += chunk.toString().replaceAll("\r", "");
      const chunkSize = Buffer.byteLength(chunk, encoding || "utf8");
      this.newObjects = this.buffer.split("\n");
      this.buffer = this.newObjects.pop() ?? "";

      for (const line of this.newObjects) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        this.lineNumber++;
        if (!this.headers) {
          this.headers = cleanLine.split(this.delimiter).map((header) => header.trim());
          continue;
        }

        const values = cleanLine.split(this.delimiter).map((value) => value.trim());
        if (values.length > this.headers.length) {
          throw new Error(`Broken data at line ${this.lineNumber}`);
        }
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index] ?? "";
        });
        record._line = this.lineNumber;

        this.push(record);
      }
      this.progressReport.progressView(chunkSize);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    try {
      if (this.buffer.trim()) {
        this.lineNumber++;
        const values = this.buffer.split(this.delimiter).map((cutter) => cutter.trim());
        if (values.length > this.headers.length) {
          throw new Error(`Broken data at line ${this.lineNumber}`);
        }
        const record = {};
        this.headers.forEach((header, index) => {
          record[header] = values[index] ?? "";
        });
        record._line = this.lineNumber;
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

class DataTransformer extends Transform {
  constructor(transformerErrors, options = {}) {
    super({ objectMode: true });
    this.validationErrors = transformerErrors;
  }

  _validateRecord(record, lineNumber) {
    const errors = [];

    if (!record.name || !record.name.trim()) {
      errors.push({
        line: lineNumber,
        field: "name",
        value: record.name,
        reason: "Name must not be empty",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email || "")) {
      errors.push({
        line: lineNumber,
        field: "email",
        value: record.email,
        reason: "Invalid email format",
      });
    }

    if (record.phone === "INVALID" || !record.phone) {
      errors.push({
        line: lineNumber,
        field: "phone",
        value: record.phone,
        reason: "Phone number must be 10 digits",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.birthdate || "")) {
      errors.push({
        line: lineNumber,
        field: "birthdate",
        value: record.birthdate,
        reason: "Expected standardized date in YYYY-MM-DD format",
      });
    }

    return errors;
  }

  _transform(record, encoding, callback) {
    try {
      const lineNumber = record._line ?? null;
      const transformed = {
        name: capitalizeName(record.name),
        email: normalizeEmail(record.email),
        phone: formatPhone(record.phone),
        birthdate: standardizeDate(record.birthdate),
        city: capitalizeName(record.city),
      };
      const validateIssues = this._validateRecord(transformed, lineNumber);
      if (validateIssues.length > 0) {
        this.validationErrors.push(...validateIssues);
      }

      this.push(transformed);
      callback();
    } catch (error) {
      callback(error);
    }
  }
}

class CSVWriter extends Transform {
  constructor(delimiter = ",", options = {}) {
    super({ objectMode: true });
    this.headerWritten = false;
    this.delimiter = delimiter;
  }

  _transform(record, encoding, callback) {
    try {
      if (!record) {
        throw new Error();
      }
      if (!this.headerWritten) {
        const headers = Object.keys(record)
          .map((key) => this._formatter(key))
          .join(this.delimiter);
        this.headerWritten = true;
        this.push(headers + "\n");
      }
      let output = "";
      output =
        Object.values(record)
          .map((value) => this._formatter(value))
          .join(this.delimiter) + "\n";

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
  if (name === null || name === undefined) return "";
  return name.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());
}

/**
 * Normalize email addresses
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email or original if invalid
 */
function normalizeEmail(email) {
  if (email === null || email === undefined) return "";
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

  if (validDate.getFullYear() != year || validDate.getMonth() != month - 1 || validDate.getDate() != day) return date;

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
async function processCSVFile(inputPath, outputPath, delimiter) {
  try {
    let transformerErrors = [];
    let size = await fs.promises.stat(inputPath);
    (await fs.promises.stat(inputPath),
      await pipeline(
        fs.createReadStream(inputPath),
        new CSVParser(delimiter, size),
        new DataTransformer(transformerErrors),
        new CSVWriter(delimiter),
        fs.createWriteStream(outputPath),
      ));
    if (transformerErrors.length > 0) {
      console.log(`Failed data tranformation: ${JSON.stringify(transformerErrors, null, 2)}`);
    }
  } catch (error) {
    const code = error?.code || error?.cause?.code;
    await fs.promises.unlink(outputPath).catch(() => {});
    if (code === "ENOENT") throw new Error(`Failed to process CSV file: File ${inputPath} not found`);
    if (code === "EACCES" || code === "EPERM") {
      throw new Error(`Failed to process CSV file: permission denied while processing ${inputPath} -> ${outputPath}`);
    } else throw new Error(`Failed to process CSV file: ${error.message}`);
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
  processCSVFile("data/users.csv", "data/users_transformed.csv", ",")
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
