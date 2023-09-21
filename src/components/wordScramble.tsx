


interface PlayerInputProps {
    guess: string,
    solutions: string[]
}

function PlayerInput({guess, solutions} : PlayerInputProps) {

    let classNames = ['player-input', 'something'];
    if (solutions.includes(guess)) {
        classNames = classNames.concat('guess-correct');

    }
    const className = classNames.join(' ');

    return (
        <div className={className}>
            {guess}
        </div>
    );
}




