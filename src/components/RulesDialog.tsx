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

export function RulesDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Rules</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle></DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    Swap letters, find words, get points. The longer the word, the more points you get.

                    <div>On your turn,
                        <ul className="ml-4">
                            <li>(1) drag to swap a pair of letters</li>
                            <li>(2) drag to select a word.</li>
                        </ul>
                    </div>
                    <div>The player with the most points after 5 rounds wins.</div>
                </div>
                <DialogFooter>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
