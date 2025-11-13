import {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Flex, Loader, Modal, Text} from "@mantine/core";
import {GetErrorMessage, LogError} from "@/utils/errors.ts";

interface ConfirmModalProps {
  message: string;
  title?: string;
  ConfirmCallback: () => Promise<void> | undefined;
  CloseCallback: () => void | undefined;
  show: boolean;
  loadingText?: string;
  cancelText?: string;
  confirmText?: string;
}

const ConfirmModal = observer(({
  message,
  title,
  ConfirmCallback,
  CloseCallback,
  show,
  loadingText,
  cancelText="Cancel",
  confirmText="Confirm"
}: ConfirmModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null | undefined>(null);

  useEffect(() => {
    setError(null);
  }, [show]);

  return (
    <Modal
      opened={show}
      onClose={CloseCallback}
      title={title}
      padding="24px"
      radius="6px"
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      <Text>{message}</Text>
      {
        loading && loadingText ?
          <Text>{loadingText}</Text> : null
      }
      {
        !error ? null :
          <div className="modal__error">
            Error: { error }
          </div>
      }
      <Flex direction="row" align="center" mt="1.5rem" justify="flex-end">
        <Button variant="outline" onClick={CloseCallback} mr="0.5rem">
          {cancelText}
        </Button>
        <Button
          disabled={loading}
          variant="filled"
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);

              if(ConfirmCallback) {
                await ConfirmCallback();
              }

              CloseCallback();
            } catch(error: unknown) {
              LogError(undefined, error);

              const errorDisplay = GetErrorMessage(error);
              setError(errorDisplay);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader type="dots" size="xs" style={{margin: "0 auto"}} color="white" /> : confirmText}
        </Button>
      </Flex>
    </Modal>
  );
});

export default ConfirmModal;
