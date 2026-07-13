import { useState } from 'react'
import { Card, Tag, Typography } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

const { Text } = Typography

export default function ValueChainMap({ chain = [], materials = [] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = chain[activeIdx]

  return (
    <div className="value-chain-map">
      <div className="value-chain-track">
        {chain.map((node, idx) => (
          <div key={node.stage} className="value-chain-node-wrap">
            <Card
              size="small"
              className={`value-chain-node ${activeIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveIdx(idx)}
              hoverable
            >
              <div className="value-chain-step">{idx + 1}</div>
              <div className="value-chain-title">{node.stage}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>{node.players}</Text>
              <div style={{ marginTop: 6 }}>
                <Tag color="volcano">利润 {node.margin}</Tag>
                <Tag color={node.risk === '高' ? 'error' : node.risk === '中' ? 'warning' : 'success'}>风险 {node.risk}</Tag>
              </div>
            </Card>
            {idx < chain.length - 1 && <ArrowRightOutlined className="value-chain-arrow" />}
          </div>
        ))}
      </div>

      {active && (
        <Card size="small" className="value-chain-detail" title={`环节详情 · ${active.stage}`}>
          <p><Text strong>主要参与者：</Text>{active.players}</p>
          <p><Text strong>利润池：</Text>{active.margin} · 典型壁垒：{active.barrier || '规模与认证'}</p>
          <p><Text strong>进入建议：</Text>{active.entryMode || '根据环节利润与风险选择出口/代理/合资/设厂'}</p>
          {materials.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text strong>关键原材料/零部件：</Text>
              {materials.map((m) => (
                <Tag key={m.name} style={{ marginTop: 4 }}>{m.name} · 来源{m.origin} · 稳定{m.stability}</Tag>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
