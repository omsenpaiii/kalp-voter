import React, { useState, useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useKalpApi } from '@/app/hooks/useKalpApi';

const ReverseScrollViewSplits = (): React.ReactNode => {
    const { getCandidate, voteForCandidate } = useKalpApi();

    const [candidates, setCandidates] = useState<{ [key: string]: number }>({
        "Narendra Modi": 0,
    });
    const [loadingState, setLoadingState] = useState<{ [key: string]: 'voting' | null }>({});
    const [showConfirmPopup, setShowConfirmPopup] = useState(false); // State for confirmation pop-up
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null); // State for selected candidate
    const [popupMessage, setPopupMessage] = useState<string | null>(null); // State for pop-up message

    const fetchVotes = async () => {
        try {
            const data = await getCandidate("Narendra Modi");
            const modiVotes = data.result.result.votes || 0; // Ensure a valid number is retrieved
            setCandidates(prevState => ({
                ...prevState,
                "Narendra Modi": modiVotes
            }));
        } catch (err) {
            console.error('Error fetching Modi votes:', err);
        }
    };

    const handleVote = (candidateName: string) => {
        setSelectedCandidate(candidateName); // Set the candidate to be confirmed
        setShowConfirmPopup(true); // Show confirmation pop-up
    };

    const confirmVote = async () => {
        if (!selectedCandidate) return;
        setLoadingState((prev) => ({ ...prev, [selectedCandidate]: 'voting' })); // Set loading state

        // Dummy loading delay of 2 seconds
        setTimeout(async () => {
            try {
                // Try to vote via server
                await voteForCandidate(selectedCandidate);
                console.log(`Voted for ${selectedCandidate}`);
                setPopupMessage(`Voting successful for candidate: ${selectedCandidate}`); // Show success pop-up
            } catch (err) {
                console.error('Vote error:', err);
                setPopupMessage(`Voting failed for candidate: ${selectedCandidate}. Please try again.`); // Show error message
            } finally {
                setLoadingState((prev) => ({ ...prev, [selectedCandidate]: null })); // Reset loading state
                setShowConfirmPopup(false); // Hide confirmation pop-up

                // Hide pop-up after 3 seconds
                setTimeout(() => setPopupMessage(null), 3000);
            }
        }, 2000); // Simulate a 2-second delay
    };

    useEffect(() => {
        fetchVotes(); // Fetch votes on page load
    }, []);

    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 1.2", "center 0.35"]
    });

    const rotate = useTransform(scrollYProgress, [0, 1], ["10deg", "0deg"]);
    const x = useTransform(scrollYProgress, [0, 1], ["-20rem", "0rem"]);
    const y = useTransform(scrollYProgress, [0, 1], ["-20rem", "0rem"]);

    return (
        <div ref={ref} className="w-full h-[50vh] flex justify-between items-center">
            <motion.div
                style={{ rotate, x }}
                className="bg-white transition-all duration-300 ease-out origin-bottom-left rounded-2xl h-full flex-[1.5]"
            >
                {/* Candidate image */}
                <img
                    src={"/images/modi-image.png"}
                    alt={"modi"}
                    className="h-full w-full object-cover rounded-2xl"
                />
            </motion.div>

            <motion.div
                style={{ y }}
                className="flex-1 text-white h-full"
            >
                <h1 className="text-[3rem] font-bold uppercase text-right">Narendra Modi</h1>
                <p className="font-normal text-right">Votes: {candidates["Narendra Modi"]}</p>
                <div className="w-full flex justify-end mt-5">
                    <button
                        onClick={() => handleVote("Narendra Modi")}
                        disabled={loadingState["Narendra Modi"] === 'voting'}
                        className="p-5 px-10 rounded-full border-[0.25px] border-white"
                    >
                        {loadingState["Narendra Modi"] === 'voting' ? "Loading..." : "Vote"}
                    </button>
                </div>
            </motion.div>

            {/* Confirmation pop-up */}
            {showConfirmPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-2">Confirm Vote</h2>
                        <p className="mb-4">Do you really want to vote for: <strong>{selectedCandidate}</strong>?</p>
                        <div className="flex justify-end">
                            <button
                                onClick={confirmVote}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out mr-2"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowConfirmPopup(false)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pop-up message */}
            {popupMessage && (
                <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-md z-50">
                    {popupMessage}
                </div>
            )}
        </div>
    );
};

export default ReverseScrollViewSplits;
