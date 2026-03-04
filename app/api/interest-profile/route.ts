import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPathPrompt, generateLearningPath } from "@/lib/claude";
import type { InterestProfile, SaveInterestProfileRequest, SaveInterestProfileResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<SaveInterestProfileResponse>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = (await req.json()) as SaveInterestProfileRequest;
    const { profile, archetypeTitle, answers, timePerWeekHrs } = body;

    const goals = Object.entries(profile as InterestProfile)
      .filter(([, score]) => score > 0.4)
      .map(([key]) => key);

    await prisma.userInterestProfile.upsert({
      where: { userId },
      update: {
        interests: profile,
        archetypeTitle,
        timePerWeekHrs,
        goals,
        lastAssessedAt: new Date(),
      },
      create: {
        userId,
        interests: profile,
        archetypeTitle,
        timePerWeekHrs,
        goals,
      },
    });

    // Get top 5 interests by score
    const topInterests = Object.entries(profile as InterestProfile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key]) => key);

    // Query resources whose interestTags overlap with the user's top interests
    const resources = await prisma.resource.findMany({
      where: {
        interestTags: {
          hasSome: topInterests,
        },
      },
    });

    // Build prompt and generate learning path
    const prompt = buildPathPrompt(
      archetypeTitle,
      topInterests,
      timePerWeekHrs ?? 3,
      resources
    );
    const generatedPath = await generateLearningPath(prompt);

    // Save the learning path
    const savedPath = await prisma.learningPath.create({
      data: {
        userId,
        title: generatedPath.path_title ?? "My Learning Path",
        generatedPath,
        aiModelVersion: "claude-sonnet-4-20250514",
      },
    });

    return NextResponse.json({ success: true, pathId: savedPath.id });
  } catch (error) {
    console.error("Failed to save interest profile:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
