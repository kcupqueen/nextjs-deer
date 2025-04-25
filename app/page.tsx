"use client";

import {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
    daysWithout: number;
    desireIntensity: number;
    hasImportantActivity: string;
    age: number;
    spermColor: string;
    anonymousId: string;
    date: Date;
}


const calculateProb = (formData: FormData) => {
    const { daysWithout, desireIntensity, hasImportantActivity, age, spermColor } = formData;
    let prob = 0.5;
    if (age <= 25) {
        prob = 0.6
    } else if (age > 25 && age <= 35) {
        prob = 0.5
    } else if (age > 35 && age <= 40) {
        prob = 0.4
    } else if (age > 40 && age <= 50) {
        prob = 0.3
    } else if (age > 50 && age <= 60) {
        prob = 0.2
    } else if (age > 60 && age <= 70) {
        prob = 0.1
    } else {
        prob = 0.05
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
    
    // Factor in sperm color
    if (spermColor === "yellow") {
        prob *= 1; // Slight decrease for yellow
    } else if (spermColor === "red") {
        prob *= 0.1; // Larger decrease for red - potential health concern
    } else if (spermColor === "green") {
        prob *= 0.2; // Decrease for green
    } else if (spermColor === "clear") {
        prob *= 1.1; // Slight increase for clear
    } else if (spermColor === "white") {
        prob *= 1;
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
    useEffect(() => {
        // 1. Handle Anonymous ID
        let anonymousId = localStorage.getItem('anonymousId');
        if (!anonymousId) {
            anonymousId = Date.now().toString(36) + Math.random().toString(36).substring(2);
            localStorage.setItem('anonymousId', anonymousId);
        }

        // 2. Load existing form data
        const formDataString = localStorage.getItem('formData');
        let loadedData = {};
        if (formDataString) {
            try {
                loadedData = JSON.parse(formDataString);
            } catch (error) {
                console.error("Failed to parse formData from localStorage", error);
                // If parsing fails, start with defaults but keep the ID
                localStorage.removeItem('formData'); // Clear corrupted data
            }
        }

        // 3. Set combined state
        setFormData(prevData => ({
            ...prevData, // Start with default values from useState
            ...loadedData, // Override with loaded data if available
            anonymousId: anonymousId as string, // Ensure ID is set
            date: new Date() // Always set the current date on load
        }));

    }, []);

    const [formData, setFormData] = useState<FormData>({
        daysWithout: 0,
        desireIntensity: 0,
        hasImportantActivity: "no",
        age: 18,
        spermColor: "white",
        anonymousId: '', // Initialize with empty string
        date: new Date() // Initialize with current date
    });

    const [prob, setProb] = useState<number>(0.5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        // 1. Calculate the new form data state
        const updatedValue = type === 'number' ? parseInt(value) || 0 : value;
        const newFormData = {
            ...formData,
            [name]: updatedValue
        };

        // 2. Update the state
        setFormData(newFormData);

        // 3. Update probability using the new data
        const newProb = calculateProb(newFormData);
        console.log("form", JSON.stringify(newFormData)); // Log the new data
        setProb(newProb);

        // 4. Save the *new* formData to localStorage
        localStorage.setItem('formData', JSON.stringify(newFormData));
        console.log('Form data saved to localStorage');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form submitted:', formData);
            setIsSuccess(true);
            // post formData to api
            const response = await fetch('/api/default', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            console.log('API response:', data);
            
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-rows-[10px_1fr_20px] items-center justify-items-center min-h-screen p-4 pt-2 pb-20 gap-8 sm:p-12 sm:pt-4 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">今天🦌不🦌?</h1>
                {isSuccess ? (
                    <ResultComponent prob={prob} />
                ) : (
                    <form onSubmit={handleSubmit} className="w-full space-y-6 bg-white shadow-md rounded-lg p-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="age" className="text-sm font-medium text-gray-700">
                                    年龄
                                </label>
                                <span className="text-sm font-medium text-gray-600">
                                    {formData.age} years - {(() => {
                                        if (formData.age >= 18 && formData.age <= 30) {
                                            return "精力充沛 💪";
                                        } else if (formData.age > 30 && formData.age <= 45) {
                                            return "中年牛马 😎";
                                        } else if (formData.age > 45 && formData.age <= 60) {
                                            return "经验丰富 👍";
                                        } else if (formData.age > 60 && formData.age <= 75) {
                                            return "稳重持久 😉";
                                        } else {
                                            return "养精蓄锐 😴";
                                        }
                                    })()}
                                </span>
                            </div>
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
                            <div className="flex justify-between items-center">
                                <label htmlFor="daysWithout" className="text-sm font-medium text-gray-700">
                                    憋了几天没🦌?
                                </label>
                                <span className="text-sm font-medium text-gray-600">
                                    {formData.daysWithout} days - {(() => {
                                        if (formData.daysWithout >= 0 && formData.daysWithout <= 3) {
                                            return "刚刚释放 😌";
                                        } else if (formData.daysWithout > 3 && formData.daysWithout <= 7) {
                                            return "蓄势待发 🔋";
                                        } else if (formData.daysWithout > 7 && formData.daysWithout <= 14) {
                                            return "压力山大 😰";
                                        } else if (formData.daysWithout > 14 && formData.daysWithout <= 30) {
                                            return "即将爆发 🌋";
                                        } else {
                                            return "危险状态 ⚠️";
                                        }
                                    })()}
                                </span>
                            </div>
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
                            <div className="flex justify-between items-center">
                                <label htmlFor="desireIntensity" className="text-sm font-medium text-gray-700">
                                    欲望强度
                                </label>
                                <span className="text-sm font-medium text-gray-600">
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
                                </span>
                            </div>
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
                            
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">
                                    最近有没有什么重要活动？
                                </label>
                                
                            </div>
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

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">
                                    蝌蚪颜色
                                </label>
                                <span className="text-sm font-medium text-gray-600">
                                    {formData.spermColor === "white" && "正常哦 继续吧"}
                                    {formData.spermColor === "yellow" && "憋得有点久了"}
                                    {formData.spermColor === "red" && "血精了我擦，住手吧"}
                                    {formData.spermColor === "green" && "绿色的?查查去吧"}
                                    {formData.spermColor === "clear" && "正常的不错"}
                                </span>
                            </div>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="white"
                                        name="spermColor"
                                        type="radio"
                                        value="white"
                                        checked={formData.spermColor === "white"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="white" className="ml-3 block text-sm font-medium text-gray-700">
                                        白色/灰色 (正常) ⚪
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="yellow"
                                        name="spermColor"
                                        type="radio"
                                        value="yellow"
                                        checked={formData.spermColor === "yellow"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="yellow" className="ml-3 block text-sm font-medium text-gray-700">
                                        黄色 🟡
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="red"
                                        name="spermColor"
                                        type="radio"
                                        value="red"
                                        checked={formData.spermColor === "red"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="red" className="ml-3 block text-sm font-medium text-gray-700">
                                        红色/粉色 🔴
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="green"
                                        name="spermColor"
                                        type="radio"
                                        value="green"
                                        checked={formData.spermColor === "green"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="green" className="ml-3 block text-sm font-medium text-gray-700">
                                        绿色 🟢
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="clear"
                                        name="spermColor"
                                        type="radio"
                                        value="clear"
                                        checked={formData.spermColor === "clear"}
                                        onChange={handleChange}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                    />
                                    <label htmlFor="clear" className="ml-3 block text-sm font-medium text-gray-700">
                                        清澈透明 💧
                                    </label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Submitting...' : `今天🦌中签率${prob}, 提交后出结果`}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
}