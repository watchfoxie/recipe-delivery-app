import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddRecipeComment20260104130000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'recipe_comment',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'recipe_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'author_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'text',
            type: 'text',
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
      'recipe_comment',
      new TableIndex({
        name: 'idx_recipe_comment_recipe_created',
        columnNames: ['recipe_id', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'recipe_comment',
      new TableIndex({
        name: 'idx_recipe_comment_author',
        columnNames: ['author_id'],
      }),
    );

    await queryRunner.createForeignKeys('recipe_comment', [
      new TableForeignKey({
        name: 'fk_comment_recipe',
        columnNames: ['recipe_id'],
        referencedTableName: 'recipe',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_comment_author',
        columnNames: ['author_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('recipe_comment', true);
  }
}
