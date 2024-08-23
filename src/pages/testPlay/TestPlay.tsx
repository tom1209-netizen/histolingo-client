import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    CircularProgress,
    Grid,
    FormControlLabel,
    Radio,
    RadioGroup,
    TextField
} from '@mui/material';
import { getIndividualTest } from "../../api/test";
import { styled, keyframes } from '@mui/system';
import correctAudio from '../../assets/audio/correct.mp3';
import wrongAudio from '../../assets/audio/wrong.mp3';

const colors = [
    '#f48fb1',
    '#e1bee7',
    '#b39ddb',
    '#9fa8da',
    '#90caf9',
    '#80cbc4',
    '#81d4fa',
    '#80deea',
    '#c5e1a5'
];

// Define keyframes for the animations
const shake = keyframes`
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
`;

const expand = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
`;

// Custom styled Paper component with conditional animations
const AnimatedPaper = styled(Paper)(({ isCorrect }) => ({
    padding: '16px',
    marginBottom: '16px',
    border: isCorrect === null
        ? 'none'
        : isCorrect
            ? '2px solid green'
            : '2px solid red',
    animation: isCorrect === null
        ? 'none'
        : isCorrect
            ? `${expand} 0.3s ease-out forwards`
            : `${shake} 0.3s ease-out`
}));

function TrueFalseQuestion({ questionsData, onAnswerChange, selectedAnswer, disabled, isCorrect }) {
    return (
        <AnimatedPaper isCorrect={isCorrect}>
            <Typography variant="h5">{questionsData.ask}</Typography>
            <Typography variant="h5">True/False Question</Typography>
            <RadioGroup onChange={(e) => onAnswerChange(e.target.value)} value={selectedAnswer}>
                <FormControlLabel value="true" control={<Radio disabled={disabled} />} label="True" />
                <FormControlLabel value="false" control={<Radio disabled={disabled} />} label="False" />
            </RadioGroup>
        </AnimatedPaper>
    );
}

function MultipleChoiceQuestion({ questionsData, onAnswerChange, selectedAnswer, disabled, isCorrect }) {
    return (
        <AnimatedPaper isCorrect={isCorrect}>
            <Typography variant="h5">{questionsData.ask}</Typography>
            <Typography variant="h5">Multiple Choice Question</Typography>
            <RadioGroup onChange={(e) => onAnswerChange(e.target.value)} value={selectedAnswer}>
                {
                    questionsData.options.map((option, index) => (
                        <FormControlLabel key={index} value={option} control={<Radio disabled={disabled} />} label={option} />
                    ))
                }
            </RadioGroup>
        </AnimatedPaper>
    );
}

function FillInTheBlankQuestion({ questionsData, onAnswerChange, selectedAnswer, disabled, isCorrect }) {
    return (
        <AnimatedPaper isCorrect={isCorrect}>
            <Typography variant="h5">{questionsData.ask}</Typography>
            <Typography variant="h5">Fill In The Blank Question</Typography>
            <TextField
                fullWidth
                label="Your Answer"
                variant="outlined"
                sx={{ marginTop: 2 }}
                onChange={(e) => onAnswerChange(e.target.value)}
                value={selectedAnswer}
                disabled={disabled}
            />
        </AnimatedPaper>
    );
}

function MatchingQuestion({ questionsData, onAnswerChange, selectedAnswer, disabled, isCorrect }) {
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [selectedDefinition, setSelectedDefinition] = useState(null);
    const [matches, setMatches] = useState(selectedAnswer || []);

    const rightColumn = questionsData['answer'].map(item => item['rightColumn']);
    const leftColumn = questionsData['answer'].map(item => item['leftColumn']);

    const handleSelectTerm = (term) => {
        setSelectedTerm(term);
        if (selectedDefinition) {
            handleMatch(term, selectedDefinition);
        }
    };

    const handleSelectDefinition = (definition) => {
        setSelectedDefinition(definition);
        if (selectedTerm) {
            handleMatch(selectedTerm, definition);
        }
    };

    const handleMatch = (term, definition) => {
        const color = colors[matches.length % colors.length];
        const newMatches = [...matches, { term, definition, color }];
        setMatches(newMatches);
        setSelectedTerm(null);
        setSelectedDefinition(null);
        onAnswerChange(newMatches);
    };

    const getTermColor = (term) => {
        const match = matches.find(match => match.term === term);
        return match ? match.color : null;
    };

    const getDefinitionColor = (definition) => {
        const match = matches.find(match => match.definition === definition);
        return match ? match.color : null;
    };

    return (
        <AnimatedPaper isCorrect={isCorrect}>
            <Container sx={{ marginTop: 4 }}>
                <Typography variant="h5">{questionsData.ask}</Typography>
                <Typography variant="h5" gutterBottom>Matching Question</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="h6">Left Column</Typography>
                        {leftColumn.map((item, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    padding: 2,
                                    marginBottom: 2,
                                    cursor: disabled ? 'default' : 'pointer',
                                    backgroundColor: getTermColor(item) || (selectedTerm === item ? 'lightgray' : 'white')
                                }}
                                onClick={() => !disabled && handleSelectTerm(item)}
                            >
                                {item}
                            </Paper>
                        ))}
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6">Right Column</Typography>
                        {rightColumn.map((item, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    padding: 2,
                                    marginBottom: 2,
                                    cursor: disabled ? 'default' : 'pointer',
                                    backgroundColor: getDefinitionColor(item) || (selectedDefinition === item ? 'lightgray' : 'white')
                                }}
                                onClick={() => !disabled && handleSelectDefinition(item)}
                            >
                                {item}
                            </Paper>
                        ))}
                    </Grid>
                </Grid>
            </Container>
        </AnimatedPaper>
    );
}

function TestPlay(props: any) {
    const [test, setTest] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedAnswers, setSubmittedAnswers] = useState({});
    const [isCorrect, setIsCorrect] = useState(null);
    const dummyId = '66c09a692c5f7b45260f8006';

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const data = await getIndividualTest(dummyId);
                setTest(data['data']['data']['test']);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching test:', error);
                setLoading(false);
            }
        };
        fetchTest();
    }, [dummyId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const questionsList = test['questionsId'];
    const currentQuestion = questionsList[currentQuestionIndex];

    const handleNext = () => {
        if (currentQuestionIndex < questionsList.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            const nextQuestionId = questionsList[currentQuestionIndex + 1]._id;
            setSelectedAnswer(submittedAnswers[nextQuestionId]?.answer || null);
            setIsSubmitted(!!submittedAnswers[nextQuestionId]);
            setIsCorrect(submittedAnswers[nextQuestionId]?.isCorrect ?? null);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            const prevQuestionId = questionsList[currentQuestionIndex - 1]._id;
            setSelectedAnswer(submittedAnswers[prevQuestionId]?.answer || null);
            setIsSubmitted(!!submittedAnswers[prevQuestionId]);
            setIsCorrect(submittedAnswers[prevQuestionId]?.isCorrect ?? null);
        }
    };

    const handleAnswerChange = (answer) => {
        setSelectedAnswer(answer);
    };

    const handleSubmit = async () => {
        try {
            const isCorrect = selectedAnswer === 'true';
            setIsSubmitted(true);
            setIsCorrect(isCorrect);

            const sound = new Audio(isCorrect ? correctAudio : wrongAudio);
            await sound.play();

            setSubmittedAnswers(prev => ({
                ...prev,
                [currentQuestion._id]: {
                    answer: selectedAnswer,
                    isCorrect: isCorrect
                }
            }));
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    return (
        <Container sx={{ marginTop: 4 }}>
            <Typography variant="h4" gutterBottom>Test Play Page</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {currentQuestion.questionType === 1 && (
                        <TrueFalseQuestion
                            questionsData={currentQuestion}
                            onAnswerChange={handleAnswerChange}
                            selectedAnswer={selectedAnswer}
                            disabled={isSubmitted}
                            isCorrect={isCorrect}
                        />
                    )}
                    {currentQuestion.questionType === 0 && (
                        <MultipleChoiceQuestion
                            questionsData={currentQuestion}
                            onAnswerChange={handleAnswerChange}
                            selectedAnswer={selectedAnswer}
                            disabled={isSubmitted}
                            isCorrect={isCorrect}
                        />
                    )}
                    {currentQuestion.questionType === 3 && (
                        <FillInTheBlankQuestion
                            questionsData={currentQuestion}
                            onAnswerChange={handleAnswerChange}
                            selectedAnswer={selectedAnswer}
                            disabled={isSubmitted}
                            isCorrect={isCorrect}
                        />
                    )}
                    {currentQuestion.questionType === 2 && (
                        <MatchingQuestion
                            questionsData={currentQuestion}
                            onAnswerChange={handleAnswerChange}
                            selectedAnswer={selectedAnswer}
                            disabled={isSubmitted}
                            isCorrect={isCorrect}
                        />
                    )}
                </Grid>
            </Grid>

            <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" color="primary" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    Previous
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isSubmitted || !selectedAnswer}>
                    Submit
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!isSubmitted || currentQuestionIndex >= questionsList.length - 1}>
                    Next
                </Button>
            </Box>
        </Container>
    );
}

export default TestPlay;