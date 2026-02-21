import type { Box } from "../entities/Box";
import type { Pallet } from "../entities/Pallet";
import type { StackedPallet } from "../entities/StackedPallet";
import type { PalletFloor } from "../entities/PalletFloor";
import type { Separator } from "../entities/Separator";
import type { PackingStrategy } from "./PackingStrategy";
import { SeparatorMaterial } from "../types";

export interface MultiPalletPackOptions {
  boxes: Box[];
  palletBase: Pallet;
  strategy: PackingStrategy;
  maxFloorsPerPallet?: number;
  namePrefix?: string;
}

export class MultiPalletBuilder {
  /**
   * Empaqueta un array de cajas en tantos pallets como sea necesario.
   * Utiliza la estrategia proporcionada para llenar piso por piso cada pallet,
   * creando nuevos pallets hasta ubicar todas las cajas.
   *
   * @param options Opciones de configuración
   * @returns Un array de StackedPallet construidos
   */
  static packMultiple(options: MultiPalletPackOptions): {
    pallets: StackedPallet[];
    unplacedBoxes: Box[];
  } {
    const {
      boxes,
      palletBase,
      strategy,
      maxFloorsPerPallet = 1,
      namePrefix = "Pallet",
    } = options;

    const constructedPallets: StackedPallet[] = [];
    let remainingBoxes = [...boxes];
    let palletIndex = 1;

    while (remainingBoxes.length > 0) {
      const floors: PalletFloor[] = [];

      const separator: Separator = {
        id: `sep-auto-${palletIndex}`,
        dimensions: {
          width: palletBase.dimensions.width,
          height: 5,
          depth: palletBase.dimensions.depth,
        },
        material: SeparatorMaterial.CARDBOARD,
        weight: 1,
        metadata: {},
      };

      for (let f = 0; f < maxFloorsPerPallet; f++) {
        if (remainingBoxes.length === 0) break;

        const packResult = strategy.pack(remainingBoxes, palletBase);

        // Si la estrategia no ubicó nada, cortamos para evitar bucle infinito
        if (packResult.placements.length === 0) break;

        floors.push({
          level: f,
          pallet: palletBase,
          boxes: packResult.placements,
          ...(f < maxFloorsPerPallet - 1 && packResult.unplacedBoxes.length > 0
            ? {
                separatorAbove: { ...separator, id: `sep-${palletIndex}-${f}` },
              }
            : {}),
        });

        remainingBoxes = packResult.unplacedBoxes;
      }

      // Si no logramos colocar nada en este pallet en lo absoluto, cortamos
      if (floors.length === 0) {
        break;
      }

      constructedPallets.push({
        id: `multi-${Date.now()}-${palletIndex}`,
        floors,
        metadata: { name: `${namePrefix} ${palletIndex}` },
      });

      palletIndex++;
    }

    return {
      pallets: constructedPallets,
      // Devuelve las que no se pudieron empaquetar por algún error (caja más grande que el pallet, etc)
      unplacedBoxes: remainingBoxes,
    };
  }
}
