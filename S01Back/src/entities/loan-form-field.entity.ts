import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 表单字段类型枚举
 */
export type FieldType = 'input' | 'textarea' | 'number' | 'select' | 'date' | 'upload' | 'radio' | 'checkbox';

/**
 * 表单字段配置实体类
 */
@Entity('loan_form_fields')
export class LoanFormField {
  /**
   * 字段ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 表单配置ID
   */
  @Column({ name: 'config_id', type: 'int' })
  configId: number;

  /**
   * 字段名
   */
  @Column({ name: 'field_name', type: 'varchar', length: 50 })
  fieldName: string;

  /**
   * 字段标签
   */
  @Column({ name: 'field_label', type: 'varchar', length: 100 })
  fieldLabel: string;

  /**
   * 字段类型
   */
  @Column({ name: 'field_type', type: 'enum', enum: ['input', 'textarea', 'number', 'select', 'date', 'upload', 'radio', 'checkbox'] })
  fieldType: FieldType;

  /**
   * 选项配置(下拉/单选/多选)
   */
  @Column({ name: 'field_options', type: 'json', nullable: true })
  fieldOptions: Array<{ label: string; value: string }>;

  /**
   * 是否必填
   */
  @Column({ name: 'is_required', type: 'tinyint', default: 0 })
  isRequired: number;

  /**
   * 验证规则
   */
  @Column({ name: 'validation_rules', type: 'json', nullable: true })
  validationRules: Record<string, any>;

  /**
   * 排序
   */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
