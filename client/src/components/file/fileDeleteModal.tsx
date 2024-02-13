import { StorageFile } from "@/types/filesTypes";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { truncateFileName } from "@/lib/utils";
import { useDeleteFileMutation } from "@/store/features/filesApiSlice";

type FileDeleteModalProps = {
    file: StorageFile;
    deleteOpen: boolean;
    setDeleteOpen: (open: boolean) => void;
    fileUploadingDeleteOpen: boolean;
    setFileUploadingDeleteOpen: (open: boolean) => void;
}

const FileDeleteModal = (props: FileDeleteModalProps) => {
    const [deleteFile] = useDeleteFileMutation();

    const handleDelete = async () => {
        await deleteFile({ id: props.file.id }).unwrap()
        props.setDeleteOpen(false);
        props.setFileUploadingDeleteOpen(false)
      }

    return (
        <AlertDialog open={props.deleteOpen} onOpenChange={props.setDeleteOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {
                            props.fileUploadingDeleteOpen ? (
                                <>
                                    You are currently <b>uploading this file</b>. Deleting it will cancel the upload. If you think file upload is taking too long, please check your internet connection or report the issue to us.
                                </>
                            ) : (
                                <>
                                    This action cannot be undone. This will permanently delete the <code>{truncateFileName(props.file.name)}</code> file
                                    and remove your data from our servers.
                                </>
                            )
                        }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default FileDeleteModal;