import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Pool {
    constructor(props?: Partial<Pool>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: false})
    address!: string

    @StringColumn_({nullable: false})
    token0!: string

    @StringColumn_({nullable: false})
    token1!: string

    @BigIntColumn_({nullable: false})
    reserve0!: bigint

    @BigIntColumn_({nullable: false})
    reserve1!: bigint

    @BigIntColumn_({nullable: false})
    totalSupply!: bigint

    @BigIntColumn_({nullable: false})
    totalSwapCount!: bigint

    @BigIntColumn_({nullable: false})
    totalMintCount!: bigint

    @BigIntColumn_({nullable: false})
    totalBurnCount!: bigint

    @BigIntColumn_({nullable: false})
    totalClaimCount!: bigint

    @BigIntColumn_({nullable: false})
    totalFeesCount!: bigint

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @DateTimeColumn_({nullable: false})
    updatedAt!: Date
}
