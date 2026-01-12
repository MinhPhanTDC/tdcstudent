import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  type QueryConstraint,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from '../config';
import { MediaFileSchema, type MediaFile, type CreateMediaInput, type MediaFilter } from '@tdc/schemas';
import { Result, success, failure, AppError, ErrorCode } from '@tdc/types';

const COLLECTION_NAME = 'media';

/**
 * Get collection reference
 */
function getCollectionRef() {
  return collection(db.instance, COLLECTION_NAME);
}

/**
 * Upload file to Firebase Storage
 */
async function uploadToStorage(
  file: File,
  category: string
): Promise<Result<{ url: string; storagePath: string }>> {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `media/${category}/${timestamp}_${safeName}`;
    const storageRef = ref(storage.instance, storagePath);

    console.log('Uploading to:', storagePath);
    await uploadBytes(storageRef, file);
    console.log('Upload complete, getting URL...');
    const url = await getDownloadURL(storageRef);
    console.log('Got URL:', url);

    return success({ url, storagePath });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
    return failure(new AppError(ErrorCode.UNKNOWN_ERROR, errorMessage));
  }
}

/**
 * Delete file from Firebase Storage
 */
async function deleteFromStorage(storagePath: string): Promise<Result<void>> {
  try {
    const storageRef = ref(storage.instance, storagePath);
    await deleteObject(storageRef);
    return success(undefined);
  } catch (error) {
    // Ignore if file doesn't exist
    return success(undefined);
  }
}

/**
 * Media repository
 */
export const mediaRepository = {
  /**
   * Find all media files with optional filters
   */
  async findAll(filter?: MediaFilter): Promise<Result<MediaFile[]>> {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

      if (filter?.type) {
        constraints.unshift(where('type', '==', filter.type));
      }
      if (filter?.category) {
        constraints.unshift(where('category', '==', filter.category));
      }
      if (filter?.isActive !== undefined) {
        constraints.unshift(where('isActive', '==', filter.isActive));
      }

      const q = query(getCollectionRef(), ...constraints);
      const snapshot = await getDocs(q);

      const files: MediaFile[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const parsed = MediaFileSchema.safeParse({
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
        if (parsed.success) {
          // Apply search filter client-side
          if (!filter?.search || parsed.data.name.toLowerCase().includes(filter.search.toLowerCase())) {
            files.push(parsed.data);
          }
        }
      }

      return success(files);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to fetch media files'));
    }
  },

  /**
   * Find media by ID
   */
  async findById(id: string): Promise<Result<MediaFile>> {
    try {
      const docRef = doc(getCollectionRef(), id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return failure(new AppError(ErrorCode.USER_NOT_FOUND, 'Media file not found'));
      }

      const data = docSnap.data();
      const parsed = MediaFileSchema.safeParse({
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      });

      if (!parsed.success) {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid media data'));
      }

      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to fetch media file'));
    }
  },

  /**
   * Find active login background images
   */
  async findLoginBackgrounds(): Promise<Result<MediaFile[]>> {
    return this.findAll({
      category: 'login-background',
      type: 'image',
      isActive: true,
    });
  },

  /**
   * Create media file (upload + save metadata)
   */
  async create(file: File, input: Omit<CreateMediaInput, 'url' | 'storagePath' | 'size'>): Promise<Result<MediaFile>> {
    try {
      // Upload to storage
      const uploadResult = await uploadToStorage(file, input.category);
      if (!uploadResult.success) {
        return uploadResult;
      }

      const { url, storagePath } = uploadResult.data;
      const now = new Date();
      const id = doc(getCollectionRef()).id;

      const mediaData: MediaFile = {
        ...input,
        id,
        url,
        storagePath,
        size: file.size,
        createdAt: now,
        updatedAt: now,
      };

      const parsed = MediaFileSchema.safeParse(mediaData);
      if (!parsed.success) {
        // Cleanup uploaded file
        await deleteFromStorage(storagePath);
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid media data'));
      }

      await setDoc(doc(getCollectionRef(), id), {
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      });

      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to create media file'));
    }
  },

  /**
   * Update media file metadata
   */
  async update(id: string, data: Partial<MediaFile>): Promise<Result<MediaFile>> {
    try {
      const existing = await this.findById(id);
      if (!existing.success) {
        return existing;
      }

      const updated = {
        ...existing.data,
        ...data,
        id,
        updatedAt: new Date(),
      };

      const parsed = MediaFileSchema.safeParse(updated);
      if (!parsed.success) {
        return failure(new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid media data'));
      }

      await updateDoc(doc(getCollectionRef(), id), {
        ...data,
        updatedAt: new Date(),
      });

      return success(parsed.data);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to update media file'));
    }
  },

  /**
   * Delete media file (storage + metadata)
   */
  async delete(id: string): Promise<Result<void>> {
    try {
      const existing = await this.findById(id);
      if (!existing.success) {
        return existing;
      }

      // Delete from storage
      await deleteFromStorage(existing.data.storagePath);

      // Delete metadata
      await deleteDoc(doc(getCollectionRef(), id));

      return success(undefined);
    } catch (error) {
      return failure(new AppError(ErrorCode.DATABASE_ERROR, 'Failed to delete media file'));
    }
  },

  /**
   * Toggle active status for login background
   */
  async toggleActive(id: string): Promise<Result<MediaFile>> {
    const existing = await this.findById(id);
    if (!existing.success) {
      return existing;
    }

    return this.update(id, { isActive: !existing.data.isActive });
  },
};
