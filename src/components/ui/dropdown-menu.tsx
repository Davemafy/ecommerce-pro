import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight } from 'lucide-react';

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>>(({ className='', sideOffset=6, ...props }, ref) => <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={`shadcn-dropdown-content ${className}`} {...props}/></DropdownMenuPrimitive.Portal>);
DropdownMenuContent.displayName='DropdownMenuContent';
const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Item>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>>(({ className='', ...props }, ref) => <DropdownMenuPrimitive.Item ref={ref} className={`shadcn-dropdown-item ${className}`} {...props}/>);
DropdownMenuItem.displayName='DropdownMenuItem';
const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Label>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>>(({ className='', ...props }, ref) => <DropdownMenuPrimitive.Label ref={ref} className={`shadcn-dropdown-label ${className}`} {...props}/>);
DropdownMenuLabel.displayName='DropdownMenuLabel';
const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>>(({ className='', ...props }, ref) => <DropdownMenuPrimitive.Separator ref={ref} className={`shadcn-dropdown-separator ${className}`} {...props}/>);
DropdownMenuSeparator.displayName='DropdownMenuSeparator';
const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>>(({ className='', children, ...props }, ref) => <DropdownMenuPrimitive.RadioItem ref={ref} className={`shadcn-dropdown-item shadcn-radio-item ${className}`} {...props}><span className="shadcn-item-indicator"><DropdownMenuPrimitive.ItemIndicator><Check/></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.RadioItem>);
DropdownMenuRadioItem.displayName='DropdownMenuRadioItem';
const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>>(({ children, ...props }, ref) => <DropdownMenuPrimitive.SubTrigger ref={ref} className="shadcn-dropdown-item" {...props}>{children}<ChevronRight className="shadcn-chevron"/></DropdownMenuPrimitive.SubTrigger>);
DropdownMenuSubTrigger.displayName='DropdownMenuSubTrigger';
const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>>((props, ref) => <DropdownMenuPrimitive.SubContent ref={ref} className="shadcn-dropdown-content" {...props}/>);
DropdownMenuSubContent.displayName='DropdownMenuSubContent';

export { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuGroup,DropdownMenuPortal,DropdownMenuSub,DropdownMenuSubContent,DropdownMenuSubTrigger,DropdownMenuRadioGroup,DropdownMenuRadioItem };
