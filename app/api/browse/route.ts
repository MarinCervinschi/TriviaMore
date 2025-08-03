import { NextRequest, NextResponse } from 'next/server';
import { BrowseService } from '@/lib/services/browse.service';
import { mockDepartments } from '@/lib/mock/browse.mock';

// Imposta a true per usare i dati mock durante lo sviluppo
const USE_MOCK_DATA = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const nodeId = searchParams.get('nodeId');
    const query = searchParams.get('q');

    // Usa i dati mock durante lo sviluppo
    if (USE_MOCK_DATA) {
      // Gestione dell'espansione dei nodi con mock data
      if (action === 'expand' && nodeId) {
        const nodeType = searchParams.get('nodeType');
        
        if (nodeType === 'course') {
          // Trova il corso nei mock data e restituisci le sue classi
          const course = mockDepartments
            .flatMap(dept => dept.courses || [])
            .find(course => course.id === nodeId);
          
          return NextResponse.json({ 
            classes: course?.classes || [] 
          });
        }
        
        if (nodeType === 'class') {
          // Trova la classe nei mock data e restituisci le sue sezioni
          const classNode = mockDepartments
            .flatMap(dept => dept.courses || [])
            .flatMap(course => course.classes || [])
            .find(cls => cls.id === nodeId);
          
          return NextResponse.json({ 
            sections: classNode?.sections || [] 
          });
        }
      }

      // Caricamento iniziale con mock data (senza sezioni pre-caricate)
      const mockTreeWithoutSections = {
        departments: mockDepartments.map(dept => ({
          ...dept,
          courses: dept.courses?.map(course => ({
            ...course,
            classes: course.classes?.map(cls => ({
              id: cls.id,
              name: cls.name,
              code: cls.code,
              description: cls.description,
              classYear: cls.classYear,
              position: cls.position,
              courseId: cls.courseId,
              _count: cls._count
              // Rimuoviamo le sections per lazy loading
            }))
            // Rimuoviamo le classes complete per lazy loading
          }))
        }))
      };
      
      return NextResponse.json(mockTreeWithoutSections);
    }

    // Produzione: usa il database
    // Gestione della ricerca
    if (query) {
      const limit = parseInt(searchParams.get('limit') || '50');
      const results = await BrowseService.searchTree(query, limit);
      return NextResponse.json(results);
    }

    // Gestione dell'espansione dei nodi
    if (action === 'expand' && nodeId) {
      const nodeType = searchParams.get('nodeType');
      
      if (nodeType === 'course') {
        const result = await BrowseService.expandCourse(nodeId);
        return NextResponse.json(result);
      }
      
      if (nodeType === 'class') {
        // TODO: Estrarre userId dal token JWT quando implementato l'auth
        const userId = undefined; // Per ora guest
        const result = await BrowseService.expandClass(nodeId, userId);
        return NextResponse.json(result);
      }

      return NextResponse.json(
        { error: 'Invalid node type' },
        { status: 400 }
      );
    }

    // Caricamento iniziale della struttura
    const tree = await BrowseService.getInitialTree();
    return NextResponse.json(tree);

  } catch (error) {
    console.error('Browse API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}