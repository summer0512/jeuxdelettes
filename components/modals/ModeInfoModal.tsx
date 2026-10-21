import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type GameMode = "daily" | "infinite" | "challenge";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  currentMode: GameMode;
};

export const ModeInfoModal = ({ isOpen, handleClose, currentMode }: Props) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose} modal>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <Dialog.Content className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Dialog.Description className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <div>
                <Dialog.Title className="text-lg leading-6 font-medium text-gray-900 text-center">
                  {currentMode === "daily" && "Mode quotidien"}
                  {currentMode === "infinite" && "Mode infini"}
                  {currentMode === "challenge" && "Mode défi"}
                </Dialog.Title>
                <div className="mt-4 text-sm text-gray-600">
                  {currentMode === "daily" && (
                    <p>
                      Un nouveau mot est publié chaque jour. Vos essais sont sauvegardés localement jusqu’au changement de jour.
                    </p>
                  )}
                  {currentMode === "infinite" && (
                    <p>
                      Jouez des mots aléatoires sans limite. Chaque partie recommence de zéro.
                    </p>
                  )}
                  {currentMode === "challenge" && (
                    <p>
                      Un ami a choisi un mot et vous a envoyé un lien. La progression est sauvegardée dans votre navigateur.
                    </p>
                  )}
                </div>
                {currentMode !== "challenge" && (
                  <p className="mt-6 text-xs text-gray-400 text-center">
                    Utilisez les boutons en haut de page pour changer de mode.
                  </p>
                )}
              </div>
            </Dialog.Description>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
