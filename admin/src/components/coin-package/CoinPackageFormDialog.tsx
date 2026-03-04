import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import type { CoinPackage, CoinPackageCreateRequest } from '@/types/coinPackage';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  coin: z.coerce.number().int().positive('Must be a positive integer'),
  price: z.coerce.number().int().positive('Must be a positive integer'),
  bonus: z.coerce.number().int().min(0, 'Must be 0 or greater'),
});

type FormValues = z.infer<typeof schema>;

interface CoinPackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coinPackage: CoinPackage | null;
  onSubmit: (data: CoinPackageCreateRequest) => Promise<void>;
  isPending: boolean;
}

export function CoinPackageFormDialog({
  open,
  onOpenChange,
  coinPackage,
  onSubmit,
  isPending,
}: CoinPackageFormDialogProps) {
  const isEditing = !!coinPackage;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', coin: 0, price: 0, bonus: 0 },
  });

  useEffect(() => {
    if (open) {
      reset(
        coinPackage
          ? {
              name: coinPackage.name,
              coin: coinPackage.coin,
              price: coinPackage.price,
              bonus: coinPackage.bonus,
            }
          : { name: '', coin: 0, price: 0, bonus: 0 }
      );
    }
  }, [open, coinPackage, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Coin Package' : 'Create Coin Package'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this coin package.'
              : 'Create a new coin package for users to purchase.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Package Name</Label>
            <Input id="name" placeholder="e.g. BASIC_20K" {...register('name')} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Coins */}
            <div className="space-y-1.5">
              <Label htmlFor="coins">Coins</Label>
              <Input id="coins" type="number" min={1} {...register('coins')} />
              {errors.coin && <p className="text-destructive text-xs">{errors.coin.message}</p>}
            </div>

            {/* Bonus */}
            <div className="space-y-1.5">
              <Label htmlFor="bonus">Bonus Coins</Label>
              <Input id="bonus" type="number" min={0} {...register('bonus')} />
              {errors.bonus && <p className="text-destructive text-xs">{errors.bonus.message}</p>}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (VND)</Label>
              <Input id="price" type="number" min={1} {...register('price')} />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
