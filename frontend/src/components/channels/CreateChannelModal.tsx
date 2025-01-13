import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useChannelStore } from '@/stores/channel.store';
import { Channel, ChannelType, CreateChannelRequest } from '@/types/channel.types';
import { Button } from '@/components/ui/Button';
import { UserSelect } from '@/components/users/UserSelect';
import { Fragment } from 'react';
import { Lock, Globe } from 'lucide-react';
import { useApiPost } from '@/services/api.service';
import type { ReactNode } from 'react';

// Channel name validation regex
const CHANNEL_NAME_REGEX = /^[\w-]{2,80}$/;

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ChannelType;
  initialMembers?: string[];
}

interface ApiChannel {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

function getErrorMessage(error: unknown): ReactNode {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Failed to create channel';
}

export function CreateChannelModal({ 
  isOpen, 
  onClose, 
  initialType = ChannelType.PUBLIC,
  initialMembers = []
}: CreateChannelModalProps) {
  const setChannels = useChannelStore(state => state.setChannels);
  const channels = useChannelStore(state => state.channels);

  const [type, setType] = useState<ChannelType>(initialType);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>(initialMembers);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Setup authenticated API call
  const { execute: createChannel, isLoading, error } = useApiPost<ApiChannel, CreateChannelRequest>(
    '/channels'
  );

  const resetForm = () => {
    setType(initialType);
    setName('');
    setDescription('');
    setMembers(initialMembers);
    setValidationError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (type === ChannelType.DM) {
      if (members.length !== 1) {
        setValidationError('Please select exactly one user for a direct message');
        return false;
      }
    } else {
      if (!name.trim()) {
        setValidationError('Channel name is required');
        return false;
      }
      if (!CHANNEL_NAME_REGEX.test(name.trim())) {
        setValidationError('Channel name can only contain letters, numbers, underscores, and hyphens');
        return false;
      }
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const newChannel = await createChannel();
      if (newChannel) {
        const normalizedChannel: Channel = {
          id: newChannel.id,
          shortId: newChannel.id.slice(-10),
          name: newChannel.name,
          type,
          members: [],
          createdAt: new Date(newChannel.created_at),
          updatedAt: new Date(newChannel.updated_at)
        };
        setChannels([...channels, normalizedChannel]);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const isDMChannel = type === ChannelType.DM;
  const isValid = isDMChannel 
    ? members.length === 1
    : name.trim().length >= 2 && CHANNEL_NAME_REGEX.test(name.trim());

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {isDMChannel ? 'New Direct Message' : 'Create Channel'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isDMChannel && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Channel Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setType(ChannelType.PUBLIC)}
                            className={`flex items-center p-3 rounded-lg border ${
                              type === ChannelType.PUBLIC
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Globe className="w-5 h-5 mr-2" />
                            <span>Public</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setType(ChannelType.PRIVATE)}
                            className={`flex items-center p-3 rounded-lg border ${
                              type === ChannelType.PRIVATE
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Lock className="w-5 h-5 mr-2" />
                            <span>Private</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Channel Name
                        </label>
                        <input
                          id="name"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          placeholder="e.g. project-discussion"
                          maxLength={80}
                          pattern="[\w-]+"
                          required
                          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          2-80 characters, letters, numbers, and hyphens only
                        </p>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description (Optional)
                        </label>
                        <input
                          id="description"
                          value={description}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                          placeholder="What's this channel about?"
                          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isDMChannel ? 'Select User' : 'Add Members (Optional)'}
                    </label>
                    <UserSelect
                      value={members}
                      onChange={setMembers}
                      maxUsers={isDMChannel ? 1 : undefined}
                    />
                  </div>

                  {(validationError || error) && (
                    <p className="text-sm text-red-600">
                      {validationError || getErrorMessage(error)}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <Button onClick={handleClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!isValid || isLoading}>
                      {isDMChannel ? 'Start Conversation' : 'Create Channel'}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 