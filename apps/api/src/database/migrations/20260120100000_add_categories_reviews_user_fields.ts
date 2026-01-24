import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddCategoriesReviewsUserFields20260120100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create recipe_category table
    await queryRunner.createTable(
      new Table({
        name: 'recipe_category',
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
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '191',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'thematic_category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'icon_class',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
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
      'recipe_category',
      new TableIndex({
        name: 'uq_recipe_category_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    // Create ingredient_category table
    await queryRunner.createTable(
      new Table({
        name: 'ingredient_category',
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
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '191',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'icon_class',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
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
      'ingredient_category',
      new TableIndex({
        name: 'uq_ingredient_category_slug',
        columnNames: ['slug'],
        isUnique: true,
      }),
    );

    // Create review table
    await queryRunner.createTable(
      new Table({
        name: 'review',
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
            name: 'rating',
            type: 'tinyint',
            unsigned: true,
            isNullable: false,
          },
          {
            name: 'comment',
            type: 'text',
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
      true,
    );

    await queryRunner.createIndices('review', [
      new TableIndex({
        name: 'uq_review_user_recipe',
        columnNames: ['user_id', 'recipe_id'],
        isUnique: true,
      }),
      new TableIndex({ name: 'idx_review_recipe', columnNames: ['recipe_id'] }),
      new TableIndex({ name: 'idx_review_user', columnNames: ['user_id'] }),
      new TableIndex({ name: 'idx_review_rating', columnNames: ['rating'] }),
    ]);

    await queryRunner.createForeignKeys('review', [
      new TableForeignKey({
        name: 'fk_review_user',
        columnNames: ['user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        name: 'fk_review_recipe',
        columnNames: ['recipe_id'],
        referencedTableName: 'recipe',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    // Add new columns to user table
    await queryRunner.addColumns('user', [
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'theme',
        type: 'enum',
        enum: ['light', 'dark'],
        default: "'light'",
      }),
    ]);

    // Add new columns to recipe table
    await queryRunner.addColumns('recipe', [
      new TableColumn({
        name: 'image_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
      new TableColumn({
        name: 'likes_count',
        type: 'int',
        default: 0,
      }),
    ]);

    // Add foreign key for recipe_category_id in recipe table
    await queryRunner.createForeignKey(
      'recipe',
      new TableForeignKey({
        name: 'fk_recipe_category',
        columnNames: ['recipe_category_id'],
        referencedTableName: 'recipe_category',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Add new columns to ingredient table
    await queryRunner.addColumns('ingredient', [
      new TableColumn({
        name: 'slug',
        type: 'varchar',
        length: '191',
        isNullable: true,
        isUnique: true,
      }),
      new TableColumn({
        name: 'icon_class',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
      new TableColumn({
        name: 'image_url',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    ]);

    // Add foreign key for ingredient_category_id in ingredient table
    await queryRunner.createForeignKey(
      'ingredient',
      new TableForeignKey({
        name: 'fk_ingredient_category',
        columnNames: ['ingredient_category_id'],
        referencedTableName: 'ingredient_category',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('ingredient', 'fk_ingredient_category');
    await queryRunner.dropForeignKey('recipe', 'fk_recipe_category');

    // Drop columns from ingredient table
    await queryRunner.dropColumns('ingredient', ['slug', 'icon_class', 'image_url']);

    // Drop columns from recipe table
    await queryRunner.dropColumns('recipe', ['image_url', 'likes_count']);

    // Drop columns from user table
    await queryRunner.dropColumns('user', ['avatar', 'theme']);

    // Drop tables
    await queryRunner.dropTable('review', true);
    await queryRunner.dropTable('ingredient_category', true);
    await queryRunner.dropTable('recipe_category', true);
  }
}
