import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddUserFavoriteRecipe20251228120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_favorite_recipe',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'recipe_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_favorite_recipe',
      new TableIndex({
        name: 'uq_user_favorite_recipe',
        columnNames: ['user_id', 'recipe_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'user_favorite_recipe',
      new TableIndex({ name: 'idx_favorite_user', columnNames: ['user_id'] }),
    );

    await queryRunner.createIndex(
      'user_favorite_recipe',
      new TableIndex({ name: 'idx_favorite_recipe', columnNames: ['recipe_id'] }),
    );

    await queryRunner.createForeignKeys('user_favorite_recipe', [
      new TableForeignKey({
        name: 'fk_favorite_user',
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_favorite_recipe',
        columnNames: ['recipe_id'],
        referencedTableName: 'recipe',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_favorite_recipe', true);
  }
}
