import { resolve, join } from 'path';
import fs from 'fs';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';
import ReadCSVService from './ReadCSVService';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    // verificar se o arquivo existe
    const filePath = join(resolve(__dirname, '..', '..', 'tmp'), filename);

    const fileExists = await fs.promises.stat(filePath);

    if (!fileExists) {
      throw new AppError('File now found');
    }

    const readCSVService = new ReadCSVService();

    const linesOfCsvFile = await readCSVService.execute(filePath);

    const allTransactionSaved: Transaction[] = linesOfCsvFile.map(line => {
      // [title, type, value, category] = line[0].split(';');
      return line[0].split(';').map(item => {
        const tempObject = { ...tempObject, title: item };
      });
    });
    console.log(allTransactionSaved);
  }
}

export default ImportTransactionsService;
