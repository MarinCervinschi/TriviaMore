import { NextResponse } from 'next/server';
import { BrowseService } from '@/lib/services/browse.service';
import { NextAuthRequest } from 'next-auth/lib';
import { auth } from '@/lib/auth';

// http://localhost:3000/api/browse
// http://localhost:3000/api/browse?nodeId=course-id&action=expand&nodeType=course
// http://localhost:3000/api/browse?action=expand&nodeId=class-id&nodeType=class
// http://localhost:3000/api/browse?q=search-term&limit=20


export const GET = auth(async function GET(request: NextAuthRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const nodeType = searchParams.get('nodeType');
        const nodeId = searchParams.get('nodeId');
        const query = searchParams.get('q');
        const userId = request.auth?.user?.id || undefined;

        if (query) {
            const limit = parseInt(searchParams.get('limit') || '50');
            const results = await BrowseService.searchTree(query, limit, userId);
            return NextResponse.json(results);
        }

        if (action && !isValidAction(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        if (action && isValidAction(action) && !isValidNodeType(nodeType)) {
            return NextResponse.json(
                { error: 'Invalid node type' },
                { status: 400 }
            );
        }

        if (action && nodeType && !nodeId) {
            return NextResponse.json(
                { error: 'nodeId is required for expand action' },
                { status: 400 }
            );
        }

        if (nodeType === 'course' && nodeId) {
            const result = await BrowseService.expandCourse(nodeId, userId);
            return NextResponse.json(result);
        }

        if (nodeType === 'class' && nodeId) {
            const result = await BrowseService.expandClass(nodeId, userId);
            return NextResponse.json(result);
        }

        const tree = await BrowseService.getInitialTree();
        return NextResponse.json(tree);

    } catch (error) {
        console.error('Browse API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}) as unknown as (request: NextAuthRequest) => Promise<NextResponse>;

function isValidNodeType(nodeType: string | null): nodeType is 'course' | 'class' {
    return nodeType === 'course' || nodeType === 'class';
}

function isValidAction(action: string | null): action is 'expand' {
    return action === 'expand';
}