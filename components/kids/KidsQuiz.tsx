'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Check,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';

import {
  kidsQuizQuestions,
  type KidsQuizQuestion,
} from './kidsQuiz';

type Props = {
  onBack?: () => void;
};

export function KidsQuiz({ onBack }: Props) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(
    null,
  );
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question: KidsQuizQuestion =
    kidsQuizQuestions[questionIndex];

  function chooseAnswer(index: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);

    if (index === question.answer) {
      setScore((current) => current + 1);
    }
  }

  function nextQuestion() {
    if (questionIndex === kidsQuizQuestions.length - 1) {
      setFinished(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
  }

  function restartQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="kids-quiz">
        <div className="kids-quiz-result">
          <div
            className="kids-quiz-result-mark"
            aria-hidden="true"
          >
            <Sparkles size={30} strokeWidth={1.6} />
          </div>

          <span className="kids-eyebrow">
            QUIZ COMPLETE
          </span>

          <h2>
            You&apos;re an archive explorer!
          </h2>

          <div className="kids-quiz-score">
            <strong>
              {score}
            </strong>

            <span>
              / {kidsQuizQuestions.length}
            </span>
          </div>

          <p>
            You discovered some fascinating things about
            Dr. B. R. Ambedkar.
          </p>

          <div className="kids-quiz-result-actions">
            <button
              type="button"
              className="kids-start-quiz"
              onClick={restartQuiz}
            >
              <RotateCcw size={20} />
              Play Again
            </button>

            {onBack && (
              <button
                type="button"
                className="kids-secondary-button"
                onClick={onBack}
              >
                Back to adventures
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progress =
    ((questionIndex + 1) / kidsQuizQuestions.length) * 100;

  return (
    <div className="kids-quiz">
      <div className="kids-quiz-header">
        <div>
          <span className="kids-eyebrow">
            QUIZ TIME
          </span>

          <h2>
            Question {questionIndex + 1}
            <span>
              {' '}
              of {kidsQuizQuestions.length}
            </span>
          </h2>
        </div>

        <div className="kids-quiz-score-small">
          Score: {score}
        </div>
      </div>

      <div className="kids-quiz-progress">
        <span
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="kids-quiz-question">
        <h3>
          {question.question}
        </h3>

        <div className="kids-quiz-options">
          {question.options.map((option, index) => {
            const isSelected =
              selectedAnswer === index;

            const isCorrect =
              selectedAnswer !== null &&
              index === question.answer;

            const isWrong =
              isSelected &&
              index !== question.answer;

            return (
              <button
                key={option}
                type="button"
                className={[
                  'kids-quiz-option',
                  isSelected
                    ? 'is-selected'
                    : '',
                  isCorrect
                    ? 'is-correct'
                    : '',
                  isWrong
                    ? 'is-wrong'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() =>
                  chooseAnswer(index)
                }
                disabled={selectedAnswer !== null}
              >
                <span className="kids-quiz-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>

                <span>
                  {option}
                </span>

                {isCorrect && (
                  <Check
                    size={21}
                    aria-hidden="true"
                  />
                )}

                {isWrong && (
                  <X
                    size={21}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedAnswer !== null && (
        <div
          className={`kids-quiz-feedback ${
            selectedAnswer === question.answer
              ? 'is-correct'
              : 'is-wrong'
          }`}
        >
          <div className="kids-quiz-feedback-heading">
            {selectedAnswer === question.answer ? (
              <>
                <Check size={22} />
                <strong>
                  That&apos;s right!
                </strong>
              </>
            ) : (
              <>
                <X size={22} />
                <strong>
                  Not quite!
                </strong>
              </>
            )}
          </div>

          <p>
            {question.explanation}
          </p>

          <small>
            {question.source}
          </small>
        </div>
      )}

      {selectedAnswer !== null && (
        <button
          type="button"
          className="kids-start-quiz kids-next-button"
          onClick={nextQuestion}
        >
          {questionIndex ===
          kidsQuizQuestions.length - 1
            ? 'See My Score'
            : 'Next Question'}

          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}