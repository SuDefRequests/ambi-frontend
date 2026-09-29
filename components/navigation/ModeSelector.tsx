import { UsersRound, GraduationCap, FileSearch, Landmark, LockKeyhole, Sparkles } from 'lucide-react';
import { modes, type Mode, type HomeCopy } from '@/lib/content';
const icons={visitor:UsersRound,student:GraduationCap,researcher:FileSearch,institution:Landmark, kids:Sparkles};
export function ModeSelector({active,onChange,copy}:{active:Mode;onChange:(mode:Mode)=>void;copy:HomeCopy}){
 return <nav className="mode-selector" aria-label="Choose your visitor mode">{modes.map(mode=>{const Icon=icons[mode];return <button key={mode} className={`mode-button ${active===mode?'is-active':''}`} aria-pressed={active===mode} onClick={()=>onChange(mode)}><Icon size={27} strokeWidth={1.65}/><span><strong>{copy.modes[mode][0]}</strong><small>{copy.modes[mode][1]}</small></span>{mode==='institution'&&<LockKeyhole size={12} className="mode-lock" aria-label="Restricted institutional access"/>}</button>})}</nav>;
}
