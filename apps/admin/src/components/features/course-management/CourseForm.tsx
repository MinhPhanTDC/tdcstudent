'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, TextArea, Button, Checkbox, Select, FormError, type SelectOption } from '@tdc/ui';
import { CreateCourseInputSchema, type CreateCourseInput } from '@tdc/schemas';
import { useSemesters } from '@/hooks/useSemesters';

interface CourseFormProps {
  onSubmit: (data: CreateCourseInput) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CreateCourseInput>;
  /** Error message from API */
  error?: string | null;
}

/**
 * CourseForm component - form for creating/editing courses
 * Requirements: 2.2, 2.3, 2.4, 7.3
 */
export function CourseForm({ onSubmit, isLoading, defaultValues, error }: CourseFormProps): JSX.Element {
  const { data: semesters = [], isLoading: semestersLoading } = useSemesters();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCourseInput>({
    resolver: zodResolver(CreateCourseInputSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnailUrl: '',
      semesterId: '',
      geniallyUrl: '',
      requiredSessions: 10,
      requiredProjects: 1,
      order: 0,
      isActive: false,
      ...defaultValues,
    },
  });

  // Build semester options
  const semesterOptions: SelectOption[] = semesters.map((semester) => ({
    value: semester.id,
    label: semester.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Tên môn học"
        placeholder="Nhập tên môn học"
        error={errors.title?.message}
        {...register('title')}
      />

      <TextArea
        label="Mô tả"
        placeholder="Nhập mô tả môn học"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <Controller
        name="semesterId"
        control={control}
        render={({ field }) => (
          <Select
            label="Học kỳ"
            placeholder="Chọn học kỳ"
            options={semesterOptions}
            error={errors.semesterId?.message}
            disabled={semestersLoading}
            {...field}
          />
        )}
      />

      <Input
        label="URL Genially"
        placeholder="https://view.genial.ly/..."
        helperText="Nhập link Genially để nhúng nội dung tương tác"
        error={errors.geniallyUrl?.message}
        {...register('geniallyUrl')}
      />

      <Input
        label="URL hình ảnh"
        placeholder="https://example.com/image.jpg"
        error={errors.thumbnailUrl?.message}
        {...register('thumbnailUrl')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Số buổi yêu cầu"
          type="number"
          min={1}
          helperText="Số buổi học cần hoàn thành"
          error={errors.requiredSessions?.message}
          {...register('requiredSessions', { valueAsNumber: true })}
        />

        <Input
          label="Số dự án yêu cầu"
          type="number"
          min={0}
          helperText="Số dự án cần nộp"
          error={errors.requiredProjects?.message}
          {...register('requiredProjects', { valueAsNumber: true })}
        />
      </div>

      <Checkbox
        label="Xuất bản ngay"
        {...register('isActive')}
      />

      <FormError message={error} />

      <div className="flex gap-3">
        <Button type="submit" loading={isLoading}>
          {defaultValues?.title ? 'Cập nhật' : 'Tạo môn học'}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Hủy
        </Button>
      </div>
    </form>
  );
}
