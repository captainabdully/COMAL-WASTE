import axios from 'axios';
import Swal from 'sweetalert2';

export const showSuccess = (title: string, text?: string) =>
  Swal.fire({ icon: 'success', title, text, timer: 1800, showConfirmButton: false });

export const showInfo = (title: string, text?: string) =>
  Swal.fire({ icon: 'info', title, text });

export const showError = (title: string, error?: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) return Promise.resolve();

  const text = axios.isAxiosError(error)
    ? error.response?.data?.message || error.message
    : error instanceof Error
      ? error.message
      : 'Please try again.';

  return Swal.fire({ icon: 'error', title, text });
};

export const confirmAction = (title: string, text: string) =>
  Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Continue',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
  }).then((result) => result.isConfirmed);
