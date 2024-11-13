import {WordSubmissionResponse, WordSubmissionState} from "~/components/Types.tsx";
import {INVALID_COLOR, IN_PROGRESS_COLOR, VALID_COLOR} from "~/components/Constants.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {clsx} from "clsx";
import {Icons} from "~/components/ui/icons.tsx";

interface WordSelectionBoxProps {
    wordSoFar: string,
    latestWordSubmission: WordSubmissionResponse | null | undefined,
    wordSubmissionState: WordSubmissionState,
}

export function WordSelectionBox({wordSoFar, latestWordSubmission, wordSubmissionState}: WordSelectionBoxProps) {

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

    const showWordScore = latestWordSubmission != undefined && latestWordSubmission.isValid && wordSoFar.length == 0;

    const wordToDisplay = wordSoFar.length > 0 ? wordSoFar : latestWordSubmission ? latestWordSubmission.wordSubmitted : '';

    return (
        <AnimatePresence>
            <motion.div variants={variants} animate={animationState} className={clsx('text-xl font-bold text-white p-4 inline-block rounded-lg')}>
                <span>{wordToDisplay}</span>
                {wordSubmissionState == 'Submitting' && <Icons.spinner className="h-4 w-4 inline animate-spin ml-1" />}
                {showWordScore && <span className={'text-xs'}>+{latestWordSubmission.score}</span>}
            </motion.div>
        </AnimatePresence>
    )
}