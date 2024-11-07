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

export function RulesDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost">Rules</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center space-y-4">
                    <div>Find the longest word in 60 seconds.</div>

                    <div>Score more points for longer words. </div>

                    <div>Win by having the most points after 5 rounds.</div>

                    <div>Drag to select.</div>
                    <DialogClose asChild>
                        <Button className="" variant="secondary">Close</Button>
                    </DialogClose>
                </div>
                <DialogFooter>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
