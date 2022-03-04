import config from 'config';
import { ApolloServer } from 'apollo-server';

const contacts = [{
    id: '1',
    candidateId: '1',
    accessCode: '0000',
    value: '+48500500500',
    kind: 'phone',
}];
const typeDefs = `
    type Contact {
        id: String!
        candidateId: String!
        value: String!
        kind: String!
    }

    type Query {
        contactByCode(code: String!): Contact
    }

    enum ActivityType{
        PHONE
    }

    input ActivityInput {
        type: ActivityType!
        action: String!
        newValue: String
        candidateId: String!
        user: String
        additionalPayload: String
        createdAt: String
    }

    type CandidateActivity {
        id: String
    }

    type Mutation {
        addCandidateActivity(activity: ActivityInput!): CandidateActivity
    }
`;
const resolvers = {
    Query: {
        contactByCode: (_, { code }) => contacts.find(({ accessCode }) => accessCode === code),
    },
    Mutation: {
        addCandidateActivity: () => ({ id: '1' }),
    },
};

export default async () => {
    const { port } = config.get('candidateService');
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    return server.listen(port);
};
