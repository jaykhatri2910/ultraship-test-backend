// GraphQL type definitions for Employee and related queries/mutations
// Includes filters, sorting, and pagination types.
export const typeDefs = `#graphql
  """
  An employee record stored in Mongo or in-memory.
  """
  type Employee {
    id: ID!
    name: String!
    age: Int!
    class: String
    subjects: [String!]!
    attendance: Float!
    role: String! # 'admin' | 'employee'
    avatar: String
    actions: [String!] # virtual: derived based on role
    date: String!
    email: String!
    flagged: Boolean!
  }

  input EmployeeFilter {
    nameContains: String
    minAge: Int
    maxAge: Int
    role: String
    attendanceMin: Float
    attendanceMax: Float
  }

  input SortBy {
    field: String!
    direction: SortDirection!
  }

  enum SortDirection {
    ASC
    DESC
  }

  type EmployeePage {
    total: Int!
    page: Int!
    pageSize: Int!
    items: [Employee!]!
  }

  input EmployeeInput {
    name: String!
    age: Int!
    class: String
    subjects: [String!]!
    attendance: Float!
    role: String!
    avatar: String
    date: String!
    email: String!
    flagged: Boolean
  }

  input EmployeeUpdateInput {
    name: String
    age: Int
    class: String
    subjects: [String!]
    attendance: Float
    role: String
    avatar: String
    date: String
    email: String
    flagged: Boolean
  }

  type AuthUser {
    id: ID!
    name: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  type Query {
    employees(filter: EmployeeFilter, sortBy: SortBy, page: Int = 1, pageSize: Int = 10): EmployeePage!
    employee(id: ID!): Employee
  }

  type Mutation {
    addEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeUpdateInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    login(email: String!, password: String!): AuthPayload!
  }
`;