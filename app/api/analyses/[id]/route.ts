import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatAnalysis, user, session as sessionTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Define the Promise type for params
type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    let userId;
    // Await the params to get the ID
    const { id: analysisId } = await params;

    try {
      // Get current user session from auth.api.getSession
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        // If no session, check for Authorization header
        const authHeader = request.headers.get('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          // Find session by token
          const [sessionRecord] = await db
            .select()
            .from(sessionTable)
            .where(eq(sessionTable.token, token))
            .limit(1);
          
          if (sessionRecord && sessionRecord.userId) {
            userId = sessionRecord.userId;
          }
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Verify that the user exists in the database
      const [userRecord] = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: String(authError) },
        { status: 401 }
      );
    }
    
    // Get the analysis for the current user
    const [analysis] = await db
      .select()
      .from(chatAnalysis)
      .where(eq(chatAnalysis.id, analysisId))
      .limit(1);

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this analysis
    if (analysis.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    let userId;
    // Await the params to get the ID
    const { id: analysisId } = await params;

    try {
      // Get current user session from auth.api.getSession
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        // If no session, check for Authorization header
        const authHeader = request.headers.get('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          // Find session by token
          const [sessionRecord] = await db
            .select()
            .from(sessionTable)
            .where(eq(sessionTable.token, token))
            .limit(1);
          
          if (sessionRecord && sessionRecord.userId) {
            userId = sessionRecord.userId;
          }
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: String(authError) },
        { status: 401 }
      );
    }

    // Check if the analysis exists and belongs to the user
    const [existingAnalysis] = await db
      .select()
      .from(chatAnalysis)
      .where(eq(chatAnalysis.id, analysisId))
      .limit(1);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    if (existingAnalysis.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the analysis
    await db
      .delete(chatAnalysis)
      .where(eq(chatAnalysis.id, analysisId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting analysis:", error);
    return NextResponse.json(
      { error: "Failed to delete analysis", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    let userId;
    // Await the params to get the ID
    const { id: analysisId } = await params;

    try {
      // Get current user session from auth.api.getSession
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user?.id) {
        userId = session.user.id;
      } else {
        // If no session, check for Authorization header
        const authHeader = request.headers.get('Authorization');
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          
          // Find session by token
          const [sessionRecord] = await db
            .select()
            .from(sessionTable)
            .where(eq(sessionTable.token, token))
            .limit(1);
          
          if (sessionRecord && sessionRecord.userId) {
            userId = sessionRecord.userId;
          }
        }
      }

      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { error: "Authentication failed", details: String(authError) },
        { status: 401 }
      );
    }
    
    // Check if the analysis exists and belongs to the user
    const [existingAnalysis] = await db
      .select()
      .from(chatAnalysis)
      .where(eq(chatAnalysis.id, analysisId))
      .limit(1);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    if (existingAnalysis.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse the request body to get the updated name
    const { name } = await request.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: "Name is required and must be a string" },
        { status: 400 }
      );
    }

    // Update the analysis name
    await db
      .update(chatAnalysis)
      .set({ name: name.trim() })
      .where(eq(chatAnalysis.id, analysisId));

    return NextResponse.json({ 
      success: true,
      message: "Analysis name updated successfully"
    });
  } catch (error) {
    console.error("Error updating analysis name:", error);
    return NextResponse.json(
      { error: "Failed to update analysis name", details: String(error) },
      { status: 500 }
    );
  }
} 