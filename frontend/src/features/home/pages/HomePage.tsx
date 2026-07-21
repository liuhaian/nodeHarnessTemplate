import { Card, Col, Row, Space, Statistic, Typography } from 'antd';
import { ApiOutlined, RocketOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

export default function HomePage(): JSX.Element {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          Harness Engineering Template
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          A conventions-first template designed for AI agents. Read <code>AGENTS.md</code> before making changes.
        </Typography.Paragraph>
      </div>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Backend"
              value="Express + TS"
              prefix={<ApiOutlined />}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
              Layered architecture, zod validation, structured errors, pino logging.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Frontend"
              value="React + AntD"
              prefix={<RocketOutlined />}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
              Feature slices, React Query, route-level code splitting, AntD 5.
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Guardrails"
              value="Strict TS + ESLint"
              prefix={<SafetyCertificateOutlined />}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
              strict TS, no <code>any</code>, enforced layer boundaries, tests.
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>

      <Card title="How to use this harness">
        <Typography.Paragraph>
          1. Read <code>AGENTS.md</code> — the contract for AI agents.
        </Typography.Paragraph>
        <Typography.Paragraph>
          2. Read <code>docs/conventions.md</code> for details and examples.
        </Typography.Paragraph>
        <Typography.Paragraph>
          3. Use the <code>users</code> feature as your reference implementation.
        </Typography.Paragraph>
        <Typography.Paragraph>
          4. Run <code>npm run lint && npm run typecheck && npm test</code> before finishing any task.
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
