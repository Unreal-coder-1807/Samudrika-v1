import { useConnectionStore } from '../../store/useConnectionStore'
import { CardFrame } from '../common/CardFrame'
import { DataLabel } from '../common/DataLabel'

export const SystemStatusPanel = () => {
  const { isOnline, faissIndexSize, rulesLoaded } = useConnectionStore()

  return (
    <CardFrame className="h-full">
      <h3 className="mb-2 text-lg">System Status</h3>
      <div className="space-y-2">
        <DataLabel label="FAISS INDEX SIZE" value={`${faissIndexSize} vectors`} />
        <DataLabel label="RULES LOADED" value={rulesLoaded ? 'YES' : 'NO'} />
        <DataLabel label="API STATUS" value={isOnline ? 'ONLINE' : 'OFFLINE'} />
        <DataLabel label="MODEL STATUS" value="READY" />
      </div>
    </CardFrame>
  )
}
