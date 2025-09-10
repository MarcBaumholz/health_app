import { BeakerIcon, PauseCircleIcon, BoltIcon, ArrowsUpDownIcon, EyeIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid'

const MAP: Record<string, (props: any) => JSX.Element> = {
  beaker: (p) => <BeakerIcon {...p} />, // wasser
  'pause-circle': (p) => <PauseCircleIcon {...p} />, // pausen
  bolt: (p) => <BoltIcon {...p} />, // übungen
  'arrows-up-down': (p) => <ArrowsUpDownIcon {...p} />, // haltung
  eye: (p) => <EyeIcon {...p} />, // augenpause
  'arrow-up-right': (p) => <ArrowUpRightIcon {...p} />, // stehen
}

export function AppIcon({ name, className }: { name?: string; className?: string }) {
  const Cmp = name ? MAP[name] : undefined
  if (!Cmp) return null
  return <Cmp className={className} />
}
