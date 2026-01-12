'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Input, TextArea, Button, Modal } from '@tdc/ui';
import { CreateLessonInputSchema, type CreateLessonInput, type Lesson } from '@tdc/schemas';
import { v4 as uuidv4 } from 'uuid';

interface LessonEditorProps {
  lessons: Lesson[];
  onAddLesson: (lesson: Lesson) => Promise<void>;
  onUpdateLesson?: (lesson: Lesson) => Promise<void>;
  onDeleteLesson?: (lessonId: string) => Promise<void>;
  isLoading?: boolean;
}

export function LessonEditor({
  lessons,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  isLoading,
}: LessonEditorProps): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLessonInput>({
    resolver: zodResolver(CreateLessonInputSchema),
    defaultValues: {
      title: '',
      content: '',
      duration: 10,
      order: lessons.length,
    },
  });

  const handleOpenModal = (lesson?: Lesson): void => {
    if (lesson) {
      setEditingLesson(lesson);
      reset({
        title: lesson.title,
        content: lesson.content,
        duration: lesson.duration,
        order: lesson.order,
      });
    } else {
      setEditingLesson(null);
      reset({
        title: '',
        content: '',
        duration: 10,
        order: lessons.length,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingLesson(null);
    reset();
  };

  const onSubmit = async (data: CreateLessonInput): Promise<void> => {
    if (editingLesson && onUpdateLesson) {
      await onUpdateLesson({ ...data, id: editingLesson.id });
    } else {
      await onAddLesson({ ...data, id: uuidv4() });
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-secondary-900">Danh sách bài học</h3>
        <Button onClick={() => handleOpenModal()}>Thêm bài học</Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <p className="text-center text-secondary-500">Chưa có bài học nào</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson, index) => (
              <Card key={lesson.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-secondary-900">{lesson.title}</p>
                    <p className="text-sm text-secondary-500">{lesson.duration} phút</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenModal(lesson)}>
                    Sửa
                  </Button>
                  {onDeleteLesson && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDeleteLesson(lesson.id)}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              </Card>
            ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Tiêu đề"
            placeholder="Nhập tiêu đề bài học"
            error={errors.title?.message}
            {...register('title')}
          />

          <TextArea
            label="Nội dung"
            placeholder="Nhập nội dung bài học"
            rows={6}
            error={errors.content?.message}
            {...register('content')}
          />

          <Input
            label="Thời lượng (phút)"
            type="number"
            min={1}
            error={errors.duration?.message}
            {...register('duration', { valueAsNumber: true })}
          />

          <Input
            label="Thứ tự"
            type="number"
            min={0}
            error={errors.order?.message}
            {...register('order', { valueAsNumber: true })}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" loading={isLoading}>
              {editingLesson ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
