import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { InterestProfile, SaveInterestProfileRequest, SaveInterestProfileResponse } from "@/types";

export async function POST(req: NextRequest): Promise<NextResponse<SaveInterestProfileResponse>> {
  try {
    const body = (await req.json()) as SaveInterestProfileRequest;
    const { profile, archetypeTitle, answers, timePerWeekHrs } = body;

    // ── TODO: Replace hardcoded userId with session user once NextAuth is set up ──
    // const session = await getServerSession(authOptions);
    // const userId = session?.user?.id;
    // if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const userId = "temp-user-id"; // placeholder until auth is wired up

    // Get top interests (score > 0.4) as goal tags
    const goals = Object.entries(profile as InterestProfile)
      .filter(([, score]) => score > 0.4)
      .map(([key]) => key);

    // Save or update interest profile
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

    // ── Next step: filter resources from DB by interest tags, then call Claude API ──
    // const topInterests = Object.entries(profile as InterestProfile)
    //   .sort(([, a], [, b]) => b - a)
    //   .slice(0, 5)
    //   .map(([key]) => key);
    //
    // const resources = await prisma.resource.findMany({
    //   where: { interestTags: { hasSome: topInterests } },
    //   take: 25,
    // });
    //
    // const path = await generateLearningPath(profile, archetypeTitle, timePerWeekHrs, resources);
    //
    // const savedPath = await prisma.learningPath.create({
    //   data: {
    //     userId,
    //     title: path.path_title,
    //     generatedPath: path,
    //     aiModelVersion: "claude-sonnet-4-20250514",
    //   },
    // });
    //
    // return NextResponse.json({ success: true, pathId: savedPath.id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Failed to save interest profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}