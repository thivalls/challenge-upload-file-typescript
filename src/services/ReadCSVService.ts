import fs from 'fs';
import csvParse from 'csv-parse';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ReadCSVService {
  public async execute(
    filePath: string,
  ): Promise<{
    transactions: CSVTransaction[];
    categories: string[];
  }> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      if (!title || !type || !value) return;
      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return { transactions, categories };
  }
}

export default ReadCSVService;
