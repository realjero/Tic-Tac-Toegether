import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ModalProps } from '../hooks/ModalProvider';

const MatchmakingQueueModal: React.FC<ModalProps> = () => {
    return (
        <>
            <div className="flex items-center justify-center">
                <ArrowPathIcon className="size-10 animate-spin text-text" />
            </div>
        </>
    );
};

export default MatchmakingQueueModal;
