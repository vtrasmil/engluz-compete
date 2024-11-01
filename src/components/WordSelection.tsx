import {WordSubmissionResponse, WordSubmissionState} from "~/components/Types.tsx";
import {INVALID_COLOR, IN_PROGRESS_COLOR, VALID_COLOR} from "~/components/Constants.tsx";
import {AnimatePresence, easeInOut, motion} from "framer-motion";
import {clsx} from "clsx";

enum WordSelectionState {
    InProgress,
    Valid,
    Invalid,
}

interface WordSelectionBoxProps {
    wordSoFar: string,
    latestWordSubmission: WordSubmissionResponse | null | undefined,
}

export function WordSelectionBox({wordSoFar, latestWordSubmission}: WordSelectionBoxProps) {

    const variants = {
        noSelection: { opacity: 0 },
        inProgress: { opacity: 1, backgroundColor: IN_PROGRESS_COLOR },
        valid: { opacity: 1, backgroundColor: VALID_COLOR },
        invalid: { opacity: 1, backgroundColor: INVALID_COLOR },
    }

    let animationState: string;
    if (wordSoFar.length > 0) {
        animationState = 'inProgress';
    } else if (latestWordSubmission && latestWordSubmission.isValid) {
        animationState = 'valid';
    } else if (latestWordSubmission && !latestWordSubmission.isValid) {
        animationState = 'invalid';
    } else {
        animationState = 'noSelection';
    }

    const wordToDisplay = wordSoFar.length > 0 ? wordSoFar : latestWordSubmission ? latestWordSubmission.wordSubmitted : '';

    return (
        <AnimatePresence>
            <motion.div variants={variants} animate={animationState} className={clsx('text-xl font-bold text-white p-4 inline-block rounded-lg')}>
                <span>{wordToDisplay}</span>
                {latestWordSubmission != undefined && latestWordSubmission.isValid && wordSoFar.length == 0 && <span className={'text-xs'}>+{latestWordSubmission.score}</span>}
            </motion.div>
        </AnimatePresence>
    )
}