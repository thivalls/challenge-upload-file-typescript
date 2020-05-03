import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const balance = await transactionRepository.getBalance();
    if (balance.total - value < 0 && type === 'outcome') {
      throw new AppError("You can't remove this amount");
    }

    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      select: ['id'],
      where: {
        title: category,
      },
    });

    const category_id = !categoryExists
      ? (await categoryRepository.save({ title: category })).id
      : categoryExists.id;

    const transaction: Transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
