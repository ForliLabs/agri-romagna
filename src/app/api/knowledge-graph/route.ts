import {
  farmerProfilesStore,
  fieldDossiersStore,
  getKnowledgeGraph,
  getSeasonalDigests,
  knowledgeEntitiesStore,
  knowledgeQueriesStore,
  knowledgeRelationsStore,
} from "@/lib/knowledge-graph-data";

export async function GET() {
  const [entities, relations, queries, dossiers, farmers] = await Promise.all([
    knowledgeEntitiesStore.findAll(),
    knowledgeRelationsStore.findAll(),
    knowledgeQueriesStore.findAll(),
    fieldDossiersStore.findAll(),
    farmerProfilesStore.findAll(),
  ]);

  return Response.json({
    ...getKnowledgeGraph(),
    entities,
    relations,
    queries,
    fieldDossiers: dossiers,
    seasonalDigests: getSeasonalDigests(),
    farmers,
  });
}
