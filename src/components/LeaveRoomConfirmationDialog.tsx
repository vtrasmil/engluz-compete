import { Button } from "src/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "src/components/ui/dialog"
import {DialogClose} from "@radix-ui/react-dialog";

interface LeaveRoomConfirmationDialogProps {
    onClick: () => void,
    roomCode: string
}

export function LeaveRoomConfirmationDialog({onClick, roomCode} : LeaveRoomConfirmationDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Leave Room</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-center">
                    <div>You sure?</div>
                    <Button className="" onClick={onClick}>Leave</Button>
                    <DialogClose asChild>
                        <Button className="" variant="secondary">Cancel</Button>
                    </DialogClose>
                </div>
                <DialogFooter>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
