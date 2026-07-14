import { Button, Descriptions, Divider, Space, Tag, Typography } from 'antd'

const { Text } = Typography

export default function MarketSnapshotDrawer({
  selectedGeo,
  snapshot,
  onClose,
  onGoStructure,
  onGoForecast,
  onGoCompetition,
}) {
  if (!snapshot) return null

  return (
    <>
      <Descriptions bordered column={1} size="small" title="关键经济指标">
        {snapshot.gdp && <Descriptions.Item label="GDP">{snapshot.gdp}</Descriptions.Item>}
        {snapshot.inflation && <Descriptions.Item label="通胀率">{snapshot.inflation}</Descriptions.Item>}
        {snapshot.unemployment && <Descriptions.Item label="失业率">{snapshot.unemployment}</Descriptions.Item>}
        {snapshot.incomeLevel && <Descriptions.Item label="收入水平">{snapshot.incomeLevel}</Descriptions.Item>}
        {snapshot.fxVolatility && <Descriptions.Item label="汇率波动">{snapshot.fxVolatility}</Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={1} size="small" title="人口结构">
        {snapshot.population && <Descriptions.Item label="人口">{snapshot.population}</Descriptions.Item>}
        {snapshot.ageDistribution && <Descriptions.Item label="年龄分布">{snapshot.ageDistribution}</Descriptions.Item>}
        {snapshot.urbanization && <Descriptions.Item label="城市化率">{snapshot.urbanization}</Descriptions.Item>}
        {snapshot.consumptionStructure && <Descriptions.Item label="消费结构">{snapshot.consumptionStructure}</Descriptions.Item>}
        {snapshot.density && <Descriptions.Item label="密度">{snapshot.density}</Descriptions.Item>}
        {snapshot.retailIndex && <Descriptions.Item label="零售指数">{snapshot.retailIndex}</Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={1} size="small" title="产业结构">
        {snapshot.industryPrimary && <Descriptions.Item label="第一产业">{snapshot.industryPrimary}</Descriptions.Item>}
        {snapshot.industrySecondary && <Descriptions.Item label="第二产业">{snapshot.industrySecondary}</Descriptions.Item>}
        {snapshot.industryTertiary && <Descriptions.Item label="第三产业">{snapshot.industryTertiary}</Descriptions.Item>}
        {snapshot.dominantIndustry && <Descriptions.Item label="主导产业">{snapshot.dominantIndustry}</Descriptions.Item>}
        {snapshot.clusterMaturity && <Descriptions.Item label="集群成熟度"><Tag>{snapshot.clusterMaturity}</Tag></Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={1} size="small" title="外贸指标">
        {snapshot.import && <Descriptions.Item label="进口额">{snapshot.import}</Descriptions.Item>}
        {snapshot.export && <Descriptions.Item label="出口额">{snapshot.export}</Descriptions.Item>}
        {snapshot.tradeBalance && <Descriptions.Item label="顺逆差">{snapshot.tradeBalance}</Descriptions.Item>}
        {snapshot.mainPartners && <Descriptions.Item label="主要贸易伙伴">{snapshot.mainPartners}</Descriptions.Item>}
        {snapshot.mainCategories && <Descriptions.Item label="主要品类">{snapshot.mainCategories}</Descriptions.Item>}
      </Descriptions>

      <Divider style={{ margin: '12px 0' }} />

      <Descriptions bordered column={1} size="small" title="商业环境">
        {snapshot.businessEnv != null && <Descriptions.Item label="营商环境得分">{snapshot.businessEnv}</Descriptions.Item>}
        {snapshot.lpi && <Descriptions.Item label="物流绩效(LPI)">{snapshot.lpi}</Descriptions.Item>}
        {snapshot.corruptionIndex != null && <Descriptions.Item label="腐败感知指数">{snapshot.corruptionIndex}</Descriptions.Item>}
      </Descriptions>

      <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 12 }}>
        层级穿透：点击地图区域可下钻至省/州 → 城市 → 邮编区；图表选择将自动聚焦空间聚集区。
      </Text>

      <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
        <Button block onClick={() => { onGoStructure(); onClose() }}>市场结构解构</Button>
        <Button block onClick={() => { onGoForecast(); onClose() }}>需求预测分析</Button>
        <Button type="primary" block onClick={() => { onGoCompetition(); onClose() }}>竞争态势分析</Button>
      </Space>
    </>
  )
}
