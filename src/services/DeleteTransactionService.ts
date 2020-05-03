import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transactionExists = transactionRepository.findOne(id);

    if (!transactionExists) {
      throw new AppError('Transaction not found');
    }

    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
