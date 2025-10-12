import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitCoreTables20251012190000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '191',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '191',
            isNullable: false,
          },
          {
            name: 'preferences_json',
            type: 'json',
            isNullable: true,
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
    );

    await queryRunner.createTable(
      new Table({
        name: 'ingredient',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '191',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'synonyms_json',
            type: 'json',
            isNullable: true,
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
    );

    await queryRunner.createTable(
      new Table({
        name: 'recipe',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '191',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '191',
          },
          {
            name: 'difficulty',
            type: "enum",
            enum: ['easy', 'medium', 'hard'],
            default: "'easy'",
          },
          {
            name: 'total_time_min',
            type: 'int',
          },
          {
            name: 'servings',
            type: 'int',
            default: '1',
          },
          {
            name: 'rating_avg',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: '0.00',
          },
          {
            name: 'dietary_tags_json',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'category_id',
            type: 'int',
            isNullable: true,
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
    );

    await queryRunner.createIndices('recipe', [
      new TableIndex({ name: 'idx_recipe_category', columnNames: ['category_id'] }),
      new TableIndex({ name: 'idx_recipe_difficulty', columnNames: ['difficulty'] }),
      new TableIndex({ name: 'idx_recipe_total_time', columnNames: ['total_time_min'] }),
      new TableIndex({ name: 'idx_recipe_author', columnNames: ['author_id'] }),
    ]);

    await queryRunner.createForeignKey(
      'recipe',
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'recipe_step',
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
          },
          {
            name: 'step_order',
            type: 'int',
          },
          {
            name: 'text',
            type: 'text',
          },
          {
            name: 'timer_sec',
            type: 'int',
            isNullable: true,
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
        indices: [
          new TableIndex({
            name: 'idx_recipe_step_recipe_order',
            columnNames: ['recipe_id', 'step_order'],
            isUnique: true,
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'recipe_step',
      new TableForeignKey({
        columnNames: ['recipe_id'],
        referencedTableName: 'recipe',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'recipe_ingredient',
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
          },
          {
            name: 'ingredient_id',
            type: 'int',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '32',
            isNullable: true,
          },
          {
            name: 'note',
            type: 'varchar',
            length: '191',
            isNullable: true,
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
        uniques: [
          {
            name: 'uq_recipe_ingredient_unique',
            columnNames: ['recipe_id', 'ingredient_id', 'unit'],
          },
        ],
        indices: [
          new TableIndex({ name: 'idx_recipe_ingredient_recipe', columnNames: ['recipe_id'] }),
          new TableIndex({ name: 'idx_recipe_ingredient_ingredient', columnNames: ['ingredient_id'] }),
        ],
      }),
    );

    await queryRunner.createForeignKeys('recipe_ingredient', [
      new TableForeignKey({
        columnNames: ['recipe_id'],
        referencedTableName: 'recipe',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['ingredient_id'],
        referencedTableName: 'ingredient',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const recipeIngredientTable = await queryRunner.getTable('recipe_ingredient');
    if (recipeIngredientTable) {
      await queryRunner.dropForeignKeys('recipe_ingredient', recipeIngredientTable.foreignKeys);
    }
    await queryRunner.dropTable('recipe_ingredient');

    const recipeStepTable = await queryRunner.getTable('recipe_step');
    if (recipeStepTable) {
      await queryRunner.dropForeignKeys('recipe_step', recipeStepTable.foreignKeys);
    }
    await queryRunner.dropTable('recipe_step');

    const recipeTable = await queryRunner.getTable('recipe');
    if (recipeTable) {
      await queryRunner.dropForeignKeys('recipe', recipeTable.foreignKeys);
    }
    await queryRunner.dropTable('recipe');

    await queryRunner.dropTable('ingredient');
    await queryRunner.dropTable('user');
  }
}