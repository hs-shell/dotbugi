import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import type { Vod } from '@/content/types';
import type React from 'react';
import { Button } from '@/components/ui/button';

interface ModalProps {
  vod: Vod;
  onClose: () => void;
}

const CourseHideModal: React.FC<ModalProps> = ({ vod, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsVisible(false);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleHideCourse = () => {
    handleClose();
  };

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // 모달 클릭 시 닫히지 않도록 방지
      >
        <h2 className="text-xl font-bold mb-2">해당 강좌를 숨기시겠습니까?</h2>
        <p className="text-lg font-medium text-zinc-600">
          {vod.courseTitle} - {vod.subject}
        </p>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          <Button variant="destructive" onClick={handleHideCourse}>
            숨기기
          </Button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('shadow-modal-root');
  if (!modalRoot) {
    console.error('Modal root element not found.');
    return null;
  }

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default CourseHideModal;
