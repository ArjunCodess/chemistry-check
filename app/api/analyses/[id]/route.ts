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
    // Await the params to get the ID
    const { id: analysisId } = await params;
    
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

    if (analysis.isPublic) {
      return NextResponse.json(analysis);
    }
    
    let userId;

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

    // Parse the request body to get the updated fields
    const body = await request.json();
    const updateData: { name?: string; isPublic?: boolean } = {};
    
    if (body.name !== undefined) {
      if (typeof body.name !== 'string') {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }
    
    if (body.isPublic !== undefined) {
      if (typeof body.isPublic !== 'boolean') {
        return NextResponse.json(
          { error: "isPublic must be a boolean" },
          { status: 400 }
        );
      }
      updateData.isPublic = body.isPublic;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the analysis
    await db
      .update(chatAnalysis)
      .set(updateData)
      .where(eq(chatAnalysis.id, analysisId));

    return NextResponse.json({ 
      success: true,
      message: "Analysis updated successfully"
    });
  } catch (error) {
    console.error("Error updating analysis:", error);
    return NextResponse.json(
      { error: "Failed to update analysis", details: String(error) },
      { status: 500 }
    );
  }
} 