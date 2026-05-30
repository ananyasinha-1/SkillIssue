import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { databases, DATABASE_ID, SKILLS_TABLE_ID, Query } from "../lib/appwrite"
import { Marquee } from "./Marquee"
import SkillCard from "./SkillCard"

export function Testimonials() {
    const [skills, setSkills] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchSkills() {
            try {
                if (!databases) {
                    setLoading(false)
                    return
                }
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    SKILLS_TABLE_ID,
                    [
                        Query.limit(10)
                    ]
                )
                setSkills(res.documents.map(doc => ({ ...doc, id: doc.$id })))
            } catch (err) {
                console.error("Failed to load skills:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSkills()
    }, [])

    if (loading) return null
    if (!skills || skills.length === 0) return null

    const firstRow = skills.slice(0, Math.ceil(skills.length / 2))
    const secondRow = skills.slice(Math.ceil(skills.length / 2))

    return (
        <section id="features" className="relative">
            <div className="section-divider" />

            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mb-20 mt-10">
                {/* Header section */}
                <div className="text-center mb-10 max-w-3xl mx-auto px-6">
                    <span className="inline-block font-satoshi text-sm font-medium tracking-widest uppercase text-accent/70 mb-3">
                        Featured Skills
                    </span>
                    <h2 className="font-clash font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.1] mb-4">
                        Discover top <span className="italic text-accent">AI skills</span>
                    </h2>
                </div>

                {/* Marquee rows */}
                <div className="flex flex-col gap-4 w-full">
                    {firstRow.length > 0 && (
                        <Marquee pauseOnHover className="[--duration:40s] py-2">
                            {firstRow.map((skill) => (
                                <div key={skill.id} className="w-[350px] mx-3">
                                    <SkillCard skill={skill} onClick={() => navigate(`/skill/${skill.id}`)} />
                                </div>
                            ))}
                        </Marquee>
                    )}
                    {secondRow.length > 0 && (
                        <Marquee reverse pauseOnHover className="[--duration:40s] py-2">
                            {secondRow.map((skill) => (
                                <div key={skill.id} className="w-[350px] mx-3">
                                    <SkillCard skill={skill} onClick={() => navigate(`/skill/${skill.id}`)} />
                                </div>
                            ))}
                        </Marquee>
                    )}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[10%] md:w-[15%] bg-gradient-to-r from-navy to-transparent"></div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-[10%] md:w-[15%] bg-gradient-to-l from-navy to-transparent"></div>
            </div>
        </section>
    )
}
