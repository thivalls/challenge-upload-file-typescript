import fs from 'fs';
import { getRepository, getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

import AppError from '../errors/AppError';
import ReadCSVService from './ReadCSVService';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string | Category;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const fileExists = await fs.promises.stat(filePath);
    if (!fileExists) {
      throw new AppError('File now found');
    }
    const readCSVService = new ReadCSVService();
    const { categories, transactions } = await readCSVService.execute(filePath);

    const categoriesRepository = getRepository(Category);

    const existingCategories: Category[] = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const getTitleExistingCategories: string[] = existingCategories.map(
      (category: Category) => category.title,
    );

    const categoriesToSave = categories
      .filter(
        (category: string) => !getTitleExistingCategories.includes(category),
      )
      .filter((value, index, self) => self.indexOf(value) === index);

    const prepareCategoriesToSave = categoriesRepository.create(
      categoriesToSave.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(prepareCategoriesToSave);

    const allCategoriesInProcess: Category[] = [
      ...prepareCategoriesToSave,
      ...existingCategories,
    ];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const prepareTransactionsToCreate = transactionsRepository.create(
      transactions.map((transaction: CSVTransaction) => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategoriesInProcess.find(
          (category: Category) => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(prepareTransactionsToCreate);

    await fs.promises.unlink(filePath);

    return prepareTransactionsToCreate;
  }
}

export default ImportTransactionsService;
