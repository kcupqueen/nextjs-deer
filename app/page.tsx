"use client";

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
    daysWithout: number;
    desireIntensity: number;
    hasImportantActivity: string;
    age: number;
}


const calculateProb = (formData: FormData) => {
    const { daysWithout, desireIntensity, hasImportantActivity, age } = formData;
    let prob = 0.5;
    if (age < 25) {
        prob = 0.6
    } else if (age > 25 && age < 35) {
        prob = 0.5
    } else if (age > 35 && age < 40) {
        prob = 0.4
    } else {
        prob = 0.3
    }



    if (daysWithout >= 7) {
        prob *= 1.1;
    } else if (daysWithout >= 14) {
        prob *= 1.2
    } else if (daysWithout >= 30) {
        prob *= 1.3
    } else if (daysWithout < 7) {
        prob *= 0.8
    } else if (daysWithout < 2) {
        prob *= 0.5
    } else if (daysWithout < 1) {
        prob *= 0.1
    }

    const intensity = 1 + (desireIntensity / 5);

    prob *= intensity;

    if (hasImportantActivity === "no") {
        prob *= 1.1;
    } else {
        prob *= 0.9;
    }

    prob = Math.round(prob * 100) / 100;

    if (prob > 1) {
        prob = 0.99
    }
    return prob;
}


const ResultComponent = ({ prob }: { prob: number }) => {
    const [randomNumber, setRandomNumber] = useState<number>(0);
    const [isAnimating, setIsAnimating] = useState<boolean>(true);

    useEffect(() => {
        let animationFrame: number;
        let startTime: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            if (progress < 2000) { // 2 seconds animation
                setRandomNumber(Math.floor(Math.random() * 100));
                animationFrame = requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
                setRandomNumber(Math.floor(Math.random() * 100));
            }
        };

        setIsAnimating(true);
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    const getResult = () => {
        if (!randomNumber) return '';
        return randomNumber > prob * 100 ? '🚫' : '🦌';
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Result</h2>
            <p className="text-center text-xl">
                {isAnimating ? (
                    <span className="font-mono">{randomNumber}</span>
                ) : (
                    <>
                        <span className="block text-2xl mt-4">{getResult()}</span>
                    </>
                )}
            </p>
        </div>
    );
}

export default function Home() {
   

    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        daysWithout: 0,
        desireIntensity: 0,
        hasImportantActivity: "no",
        age: 18
    });

    const [prob, setProb] = useState<number>(0.5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
        // update prob
        const newProb = calculateProb({
            ...formData,
            [name]: type === 'number' ? value || 0 : value
        });
        console.log("newProb", newProb);
        setProb(newProb);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form submitted:', formData);
            setIsSuccess(true);


        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">今天🦌不🦌?</h1>
                <h2 className="text-lg font-semibold text-center mb-4">中签率{prob}</h2>
                {isSuccess ? (
                    <ResultComponent prob={prob} />
                ) : (
                    <form onSubmit={handleSubmit} className="w-full space-y-6 bg-white shadow-md rounded-lg p-6">
                        <div className="space-y-2">
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                                Age
                            </label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                min="18"
                                max="100"
                                value={formData.age}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="daysWithout" className="block text-sm font-medium text-gray-700">
                                Days without 🦌
                            </label>
                            <input
                                type="number"
                                id="daysWithout"
                                name="daysWithout"
                                min="0"
                                value={formData.daysWithout}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="desireIntensity" className="block text-sm font-medium text-gray-700">
                                Sexual Desire Intensity (0-5)
                            </label>
                            <input
                                type="range"
                                id="desireIntensity"
                                name="desireIntensity"
                                min="0"
                                max="5"
                                step="1"
                                value={formData.desireIntensity}
                                onChange={handleChange}
                                className="mt-1 block w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>0</span>
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                            <p className="text-center mt-2 text-lg font-medium">
                                {
                                    [
                                        "清新寡欲 😊", // 0
                                        "心如止水 😌", // 1
                                        "微起波澜 🤔", // 2
                                        "蠢蠢欲动 😏", // 3
                                        "干柴烈火 🔥", // 4
                                        "浴火焚身 🥵"  // 5
                                    ][formData.desireIntensity]
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Have anything important today?
                            </label>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="yes"
                                        name="hasImportantActivity"
                                        type="radio"
                                        value="yes"
                                        checked={formData.hasImportantActivity === "yes"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="yes" className="ml-3 block text-sm font-medium text-gray-700">
                                        Yes
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="no"
                                        name="hasImportantActivity"
                                        type="radio"
                                        value="no"
                                        checked={formData.hasImportantActivity === "no"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="no" className="ml-3 block text-sm font-medium text-gray-700">
                                        No
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="maybe"
                                        name="hasImportantActivity"
                                        type="radio"
                                        value="maybe"
                                        checked={formData.hasImportantActivity === "maybe"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="maybe" className="ml-3 block text-sm font-medium text-gray-700">
                                        Maybe
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Submitting...' : '今天🦌否?'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}