import { useMemo, useState } from 'react'
import { App, Button, Col, Descriptions, Form, Radio, Row, Space, Tag, Typography } from 'antd'
import { Radar } from '@ant-design/charts'
import { FileTextOutlined } from '@ant-design/icons'
import {
  ASSESSMENT_ITEMS,
  calcAssessmentScore,
  getRiskLevelByScore,
} from '../../../../mock/risk'

const { Text } = Typography

const defaultValues = {
  counterparty: 90,
  country: 85,
  product: 88,
  payment: 92,
  logistics: 86,
  policy: 90,
}

export default function QuickTab({ onGoResponse }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [scores, setScores] = useState(defaultValues)

  const totalScore = useMemo(() => calcAssessmentScore(scores), [scores])
  const riskResult = useMemo(() => getRiskLevelByScore(totalScore), [totalScore])

  const radarData = useMemo(
    () =>
      ASSESSMENT_ITEMS.map((item) => ({
        item: item.label,
        score: scores[item.key] || 0,
      })),
    [scores],
  )

  const handleValuesChange = (_, allValues) => {
    setScores(allValues)
  }

  const handleGenerateReport = () => {
    message.success('快速评估报告已生成，已推送应对')
    onGoResponse?.({ score: totalScore, level: riskResult.level, title: '六维度快速评估' })
  }

  return (
    <Row gutter={16}>
      <Col xs={24} lg={12}>
        <div className="business-panel">
          <h3 className="business-panel-title">六维度快速评估</h3>
          <Form form={form} layout="vertical" initialValues={defaultValues} onValuesChange={handleValuesChange}>
            {ASSESSMENT_ITEMS.map((item) => (
              <Form.Item key={item.key} label={`${item.label}（权重 ${item.weight}%）`} name={item.key}>
                <Radio.Group>
                  {item.options.map((opt) => (
                    <Radio.Button key={opt.t} value={opt.v}>{opt.t}</Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            ))}
          </Form>
        </div>
      </Col>

      <Col xs={24} lg={12}>
        <div className="business-panel">
          <h3 className="business-panel-title">评估结果</h3>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="assessment-score-display">{totalScore}</div>
              <Text type="secondary">综合安全得分（越高越安全）</Text>
              <div style={{ marginTop: 12 }}>
                <Tag color={riskResult.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                  风险等级：{riskResult.level}
                </Tag>
              </div>
            </div>

            <div className="business-chart-box-sm">
              <Radar
                data={radarData}
                xField="item"
                yField="score"
                height={280}
                meta={{ score: { min: 0, max: 100 } }}
                color="#B32620"
                area={{ style: { fillOpacity: 0.15 } }}
              />
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="处置建议">{riskResult.suggestion}</Descriptions.Item>
            </Descriptions>

            <Button type="primary" icon={<FileTextOutlined />} block onClick={handleGenerateReport}>
              推送至风险应对
            </Button>
          </Space>
        </div>
      </Col>
    </Row>
  )
}
